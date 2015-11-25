/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/dustjs-linkedin.d.ts" />
var DustJS = require("dustjs-linkedin");
var fs = require("fs");
var argv = require('optimist')
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
DustJS.optimizers.format = function (ctx, node) { return node; };
// Create view filters
DustJS.filters["firstLetterInUpperCase"] = function (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
};
DustJS.filters["firstLetterInLowerCase"] = function (value) {
    return value.charAt(0).toLowerCase() + value.slice(1);
};
DustJS.filters["camelCase"] = function (value) {
    return value.replace(/(_[a-zA-Z])/g, function (match) { return match[1].toUpperCase(); });
};
DustJS.filters["convertType"] = function (value) {
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
DustJS.filters["optionalFieldDeclaration"] = function (value) { return value == "optional" ? "?" : ""; };
DustJS.filters["repeatedType"] = function (value) { return value == "repeated" ? "[]" : ""; };
function loadDustTemplate(name) {
    var templatePath = __dirname + "/templates/" + name + ".dust";
    var template = fs.readFileSync(templatePath, "UTF8").toString();
    var compiledTemplate = DustJS.compile(template, name);
    DustJS.loadSource(compiledTemplate);
}
// Generate the names for the model, the types, and the interfaces
function generateNames(model, prefix, name) {
    if (name === void 0) { name = ""; }
    model.fullPackageName = prefix + (name != "." ? name : "");
    // Copies the settings (I'm lazy)
    model.properties = argv.properties;
    model.camelCaseGetSet = argv.camelCaseGetSet;
    model.underscoreGetSet = argv.underscoreGetSet;
    var newDefinitions = {};
    // Generate names for messages
    // Recursive call for all messages
    var key;
    if (model.messages) {
        model.messages = model.messages.filter(function (message) {
            // Skip generation of typescript interfaces for extending messages,
            // because ProtoBufJs doesn't provide special API for them.
            if (message.ref) {
                return false;
            }
            newDefinitions[message.name] = "Builder";
            generateNames(message, model.fullPackageName, "." + (model.name ? model.name : ""));
            return true;
        });
    }
    for (key in model.messages) {
        var message = model.messages[key];
        newDefinitions[message.name] = "Builder";
        generateNames(message, model.fullPackageName, "." + (model.name ? model.name : ""));
    }
    // Generate names for enums
    for (key in model.enums) {
        var currentEnum = model.enums[key];
        newDefinitions[currentEnum.name] = "";
        currentEnum.fullPackageName = model.fullPackageName + (model.name ? "." + model.name : "");
    }
    // For fields of types which are defined in the same message,
    // update the field type in consequence
    for (key in model.fields) {
        var field = model.fields[key];
        if (typeof newDefinitions[field.type] !== "undefined") {
            field.type = model.name + "." + field.type;
        }
    }
    // Add the new definitions in the model for generate builders
    var definitions = [];
    for (key in newDefinitions) {
        definitions.push({ name: key, type: ((model.name ? (model.name + ".") : "") + key) + newDefinitions[key] });
    }
    model.definitions = definitions;
}
// Load dust templates
loadDustTemplate("module");
loadDustTemplate("interface");
loadDustTemplate("enum");
loadDustTemplate("builder");
// Load the json file
var model = JSON.parse(fs.readFileSync(argv.file).toString());
// If a packagename isn't present, use a default package name
if (!model.package) {
    model.package = "Proto2TypeScript";
}
// Generates the names of the model
generateNames(model, model.package);
// Render the model
DustJS.render("module", model, function (err, out) {
    if (err != null) {
        console.error(err);
        process.exit(1);
    }
    else {
        console.log(out);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbW1hbmQudHMiXSwibmFtZXMiOlsibG9hZER1c3RUZW1wbGF0ZSIsImdlbmVyYXRlTmFtZXMiXSwibWFwcGluZ3MiOiJBQUFBLGdEQUFnRDtBQUNoRCwyREFBMkQ7QUFFM0QsSUFBWSxNQUFNLFdBQU0saUJBQWlCLENBQUMsQ0FBQTtBQUMxQyxJQUFZLEVBQUUsV0FBTSxJQUFJLENBQUMsQ0FBQTtBQUV6QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0tBQ3pCLEtBQUssQ0FBQyw4RUFBOEUsQ0FBQztLQUNyRixNQUFNLENBQUMsR0FBRyxDQUFDO0tBQ1gsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7S0FDbEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUM7S0FDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQztLQUNaLEtBQUssQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUM7S0FDN0IsUUFBUSxDQUFDLEdBQUcsRUFBRSxvREFBb0QsQ0FBQztLQUNuRSxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztLQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDO0tBQ1osS0FBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQztLQUM5QixRQUFRLENBQUMsR0FBRyxFQUFFLG9EQUFvRCxDQUFDO0tBQ25FLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO0tBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUM7S0FDWixLQUFLLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQztLQUN4QixRQUFRLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDO0tBQ3BDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO0tBQ2xCLElBQUksQ0FBQztBQUVWLG1CQUFtQjtBQUNuQixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFDLEdBQUcsRUFBRSxJQUFJLElBQUssT0FBQSxJ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