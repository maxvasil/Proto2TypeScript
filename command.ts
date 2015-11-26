/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/dustjs-linkedin.d.ts" />

import * as DustJS from "dustjs-linkedin";
import * as fs from "fs";

let argv = require('optimist')
    .usage('Convert a ProtoBuf.js JSON description in TypeScript definitions.\nUsage: $0')
    .demand('f')
    .alias('f', 'file')
    .describe('f', 'The JSON file')
    .boolean('c')
    .alias('c', 'camelCaseGetSet')
    .describe('c', 'Generate getter and setters in camel case notation')
    .default('c', true)
    .boolean('u')
    .alias('u', 'underscoreGetSet')
    .describe('u', 'Generate getter and setters in underscore notation')
    .default('u', false)
    .boolean('p')
    .alias('p', 'properties')
    .describe('p', 'Generate properties')
    .default('p', true)
    .argv;

// Keep line breaks
DustJS.optimizers.format = (ctx, node) => node;

// Create view filters
DustJS.filters["firstLetterInUpperCase"] = (value : string)=> {
    return value.charAt(0).toUpperCase() + value.slice(1);
};

DustJS.filters["firstLetterInLowerCase"] = (value : string)=> {
    return value.charAt(0).toLowerCase() + value.slice(1);
};

DustJS.filters["camelCase"] = (value: string) => {
    return value.replace(/(_[a-zA-Z])/g, (match)=> match[1].toUpperCase());
};

DustJS.filters["convertType"] = (value : string)=> {
    switch (value.toLowerCase()) {
        case 'string':
            return 'string';
        case 'bool':
            return 'boolean';
        case 'bytes':
            return 'ByteBuffer';
        case 'double':
        case 'float':
        case 'int32':
        case 'int64':
        case 'uint32':
        case 'uint64':
        case 'sint32':
        case 'sint64':
        case 'fixed32':
        case 'fixed64':
        case 'sfixed32':
        case 'sfixed64':
            return "number";
        }

    // By default, it's a message identifier
    return value;
};

DustJS.filters["optionalFieldDeclaration"] = (value : string)=> value == "optional" ? "?" : "";

DustJS.filters["repeatedType"] = (value : string)=> value == "repeated" ? "[]" : "";

function loadDustTemplate(name : string) : void {
    let templatePath = `${__dirname}/templates/${name}.dust`;

    let template = fs.readFileSync(templatePath, "UTF8").toString();
    let compiledTemplate = DustJS.compile(template, name);

    DustJS.loadSource(compiledTemplate);
}

// Generate the names for the model, the types, and the interfaces
function generateNames(model: any, prefix: string, name: string = "") : void{

    model.fullPackageName = prefix + (name != "." ? name : "");

    // Copies the settings (I'm lazy)
    model.properties = argv.properties;
    model.camelCaseGetSet = argv.camelCaseGetSet;
    model.underscoreGetSet = argv.underscoreGetSet;

    let newDefinitions = {};

    // Generate names for messages
    // Recursive call for all messages
    let key;
    if (model.messages) {
        model.messages = model.messages.filter(function(message) {
            // Skip generation of typescript interfaces for extending messages,
            // because ProtoBufJs doesn't provide special API for them.
            if (message.ref) {
                return false;
            }

            newDefinitions[message.name] = "Builder";
            generateNames(message,model.fullPackageName, "." + (model.name ? model.name : ""));
            return true;
        });
    }

    for (key in model.messages) {
        let message = model.messages[key];
        newDefinitions[message.name] = "Builder";
        generateNames(message,model.fullPackageName, "." + (model.name ? model.name : ""));
    }

    // Generate names for enums
    for (key in model.enums) {
        let currentEnum = model.enums[key];
        newDefinitions[currentEnum.name] = "";
        currentEnum.fullPackageName = model.fullPackageName + (model.name ? "." + model.name : "");
    }

    // For fields of types which are defined in the same message,
    // update the field type in consequence
    for (key in model.fields) {
        let field = model.fields[key];
        if (typeof newDefinitions[field.type] !== "undefined") {

            field.type = model.name + "." + field.type;
        }
    }

    // Add the new definitions in the model for generate builders
    let definitions: any[] = [];
    for (key in newDefinitions) {
        definitions.push({
            name: key,
            type: ((model.name ? (model.name + ".") : "") + key) + newDefinitions[key]
        });
    }
    model.definitions = definitions;
}

// Load dust templates
loadDustTemplate("module");
loadDustTemplate("interface");
loadDustTemplate("enum");
loadDustTemplate("builder");

// Load the json file
let model = JSON.parse(fs.readFileSync(argv.file).toString());

// If a packagename isn't present, use a default package name
if (!model.package) {
    model.package = "Proto2TypeScript";
}

// Generates the names of the model
generateNames(model, model.package);

// Render the model
DustJS.render("module", model, (err, out) => {
    if (err != null) {
        console.error(err);
        process.exit(1);
    } else {
        console.log(out);
    }
});
