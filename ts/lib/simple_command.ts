import * as process from 'process';

export type Options = Map<string, any>;

export type Command = { command?: string, options: Options };

export function parseCommand(argv: string[]): Command | undefined {
    if (argv.length < 3) {
        console.log('no enough command');
        return;
    }
    let command: Command = { options: new Map() };
    let start = 2;
    let firstArg = argv[2];
    if (!firstArg.startsWith('--')) {
        command.command = firstArg;
        start = 3;
    }

    let curKey: string | undefined;

    while (start < argv.length) {
        let arg = argv[start];
        if (arg.startsWith('--')) {
            curKey = arg.substr(2);
            // command.options.set(curKey, '9x9x');
        } else {
            if (curKey) {
                let tempKey = command.options.get(curKey);
                console.log('tempKey:', tempKey, 'arg:', arg, 'curKey:', curKey)
                if (tempKey !== undefined) {
                    let tempValue = command.options.get(curKey);
                    console.log('tempValue:', tempValue)
                    console.log('typeof:', typeof tempValue)
                    // command.options.set(curKey, []);
                    if (typeof tempValue === 'string') {
                        command.options.set(curKey, [tempValue, arg])
                    } else { // it is an Array
                        let items = [];
                        for (let item of tempValue) {
                            items.push(item);
                        }
                        items.push(arg);
                        command.options.set(curKey, items);
                    }

                } else if (tempKey === undefined) {
                    command.options.set(curKey, arg);
                }
                // command.options.set(curKey, arg);
                curKey = undefined;
            } else {
                console.error(`error command ${arg}, key must start with --`);
                return undefined;
            }
        }
        ++start;
    }
    return command;
}
