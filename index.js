var command_1 = require('./command');
if (module.parent) {
    // Module is required by some other module.
    exports.generate = command_1.generate;
}
else {
    // Module is running directly from node.
    var argv = require('optimist')
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
        default: command_1.DEFAULT_SETTINGS.camelCaseGetSet,
        boolean: true
    })
        .options('u', {
        alias: 'underscoreGetSet',
        describe: 'Generate getter and setters in underscore notation',
        default: command_1.DEFAULT_SETTINGS.underscoreGetSet,
        boolean: true
    })
        .options('p', {
        alias: 'properties',
        describe: 'Generate properties',
        default: command_1.DEFAULT_SETTINGS.properties,
        boolean: true
    })
        .options('g', {
        alias: 'package',
        describe: 'Package name',
        default: command_1.DEFAULT_SETTINGS.package
    })
        .argv;
    command_1.generate(argv);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3QkFBeUMsV0FFekMsQ0FBQyxDQUZtRDtBQUVwRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNoQiwyQ0FBMkM7SUFDM0MsT0FBTyxDQUFDLFFBQVEsR0FBRyxrQkFBUSxDQUFDO0FBQ2hDLENBQUM7QUFBQyxJQUFJLENBQUMsQ0FBQztJQUNKLHdDQUF3QztJQUN4QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQ3pCLEtBQUssQ0FBQyw4RUFBOEUsQ0FBQztTQUNyRixPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ1YsS0FBSyxFQUFFLE1BQU07UUFDYixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxxQkFBcUI7S0FDbEMsQ0FBQztTQUNELE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDVixLQUFLLEVBQUUsU0FBUztRQUNoQixRQUFRLEVBQUUsdUZBQXVGO0tBQ3BHLENBQUM7U0FDRCxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ1YsS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixRQUFRLEVBQUUsb0RBQW9EO1FBQzlELE9BQU8sRUFBRSwwQkFBZ0IsQ0FBQyxlQUFlO1FBQ3pDLE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7U0FDRCxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ1YsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixRQUFRLEVBQUUsb0RBQW9EO1FBQzlELE9BQU8sRUFBRSwwQkFBZ0IsQ0FBQyxnQkFBZ0I7UUFDMUMsT0FBTyxFQUFFLElBQUk7S0FDaEIsQ0FBQztTQUNELE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDVixLQUFLLEVBQUUsWUFBWTtRQUNuQixRQUFRLEVBQUUscUJBQXFCO1FBQy9CLE9BQU8sRUFBRSwwQkFBZ0IsQ0FBQyxVQUFVO1FBQ3BDLE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7U0FDRCxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ1YsS0FBSyxFQUFFLFNBQVM7UUFDaEIsUUFBUSxFQUFFLGNBQWM7UUFDeEIsT0FBTyxFQUFFLDBCQUFnQixDQUFDLE9BQU87S0FDcEMsQ0FBQztTQUNELElBQUksQ0FBQztJQUVWLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsQ0FBQyJ9