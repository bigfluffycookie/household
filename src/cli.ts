import { pool } from "./db";
import { migrate } from "./migrate";
import { commands } from "./commands";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const [name, ...rest] = args;
const command = commands.find((c) => c.name === name);

if (!command) {
    console.error("usage: household <command>");
    for (const c of commands) {
        console.error(`  ${c.usage}`);
    }
    process.exitCode = 1;
} else {
    try {
        await migrate();
        const output = await command.run(rest);
        if (output) console.log(output);
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        process.exitCode = 1;
    }
}

await pool.end();
