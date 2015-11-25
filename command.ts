/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/dustjs-linkedin.d.ts" />

import * as DustJS from "dustjs-linkedin";
import * as fs from "fs";

export interface ISettings {
    // Required parameters.
    file: string;               // Path to input JSON file

    // Optional parameters
    outFile: string;            // Path to output file. If missed, then result will be in console output
    camelCaseGetSet: boolean;   // Generate getter and setters in camel case notation
    underscoreGetSet: boolean;  // Generate getter and setters in underscore notation
    properties: boolean,        // Generate properties
    package: string             // Result package name
}

export const DEFAULT_SETTINGS: ISettings = {
    file: undefined,
    outFile: undefined,
    camelCaseGetSet: true,
    underscoreGetSet: false,
    properties: true,
    package: "Proto2TypeScript"
};

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

let reservedWords = [
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do",
    "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "import", "in",
    "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof",
    "var", "void", "while", "with"
];
DustJS.filters["avoidReservedWords"] = (value: string) => {
    if (reservedWords.indexOf(value) >= 0) {
        return `_${value}`;
    }

    return value;
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
function generateNames(settings: ISettings, model: any, prefix: string, name: string = "") : void{

    model.fullPackageName = prefix + (name != "." ? name : "");

    // Copies the settings (I'm lazy)
    model.properties = settings.properties;
    model.camelCaseGetSet = settings.camelCaseGetSet;
    model.underscoreGetSet = settings.underscoreGetSet;

    let newDefinitions = {};

    // Generate names for messages
    // Recursive call for all messages
    if (model.messages) {
        model.messages = model.messages.filter(function(message) {
            // Skip generation of typescript interfaces for extending messages,
            // because ProtoBufJs doesn't provide special API for them.
            if (message.ref) {
                return false;
            }

            newDefinitions[message.name] = "Builder";
            generateNames(settings, message, model.fullPackageName, "." + (model.name ? model.name : ""));
            return true;
        });
    }

    for (let key in model.messages) {
        let message = model.messages[key];
        newDefinitions[message.name] = "Builder";
        generateNames(settings, message, model.fullPackageName, "." + (model.name ? model.name : ""));
    }

    // Generate names for enums
    for (let key in model.enums) {
        let currentEnum = model.enums[key];
        newDefinitions[currentEnum.name] = "";
        currentEnum.fullPackageName = model.fullPackageName + (model.name ? "." + model.name : "");
    }

    // For fields of types which are defined in the same message,
    // update the field type in consequence
    for (let key in model.fields) {
        let field = model.fields[key];
        if (typeof newDefinitions[field.type] !== "undefined") {
            field.type = model.name + "." + field.type;
        }
    }

    // Add the new definitions in the model for generate builders
    let definitions: any[] = [];
    for (let key in newDefinitions) {
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

export let generate = (settings: ISettings) => {

    // Merge the given settings with default one.
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (!(key in settings)) {
            settings[key] = DEFAULT_SETTINGS[key];
        }
    });

    // Load the json file
    let json = fs.readFileSync(settings.file).toString();
    let model = JSON.parse(json);

    // Generate names of the model.
    model.package = settings.package;
    generateNames(settings, model, model.package);

    // Generate result.
    DustJS.render("module", model, (err, out) => {
        if (err != null) {
            console.error(err);
            process.exit(1);
        } else {
            if (settings.outFile) {
                fs.writeFileSync(settings.outFile, out);
            } else {
                console.log(out);
            }
        }
    });
};
