import {DEFAULT_SETTINGS, generate} from './command'

if (module.parent) {
    // Module is required by some other module.
    exports.generate = generate;
} else {
    // Module is running directly from node.
    let argv = require('optimist')
        .usage('Convert a ProtoBuf.js JSON description in TypeScript definitions.\nUsage: $0')
        .options('f', {
            alias: 'file',
            demand: true,
            describe: 'The input JSON file'
        })
        .options('o', {
            alias: 'outFile',
            describe: 'The output d.ts file. Result is printed to console output if the parameter is skipped'
        })
        .options('c', {
            alias: 'camelCaseGetSet',
            describe: 'Generate getter and setters in camel case notation',
            default: DEFAULT_SETTINGS.camelCaseGetSet,
            boolean: true
        })
        .options('u', {
            alias: 'underscoreGetSet',
            describe: 'Generate getter and setters in underscore notation',
            default: DEFAULT_SETTINGS.underscoreGetSet,
            boolean: true
        })
        .options('p', {
            alias: 'properties',
            describe: 'Generate properties',
            default: DEFAULT_SETTINGS.properties,
            boolean: true
        })
        .options('g', {
            alias: 'package',
            describe: 'Package name',
            default: DEFAULT_SETTINGS.package
        })
        .argv;

    generate(argv);
}
