const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
function loadEnv() {
    const envPath = path.join(__dirname, ".env");
    const env = {};

    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        content.split("\n").forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const [key, ...valueParts] = trimmed.split("=");
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join("=").trim();
                }
            }
        });
    } else {
        console.warn("Warning: .env file not found. API keys will not be injected.");
        console.warn("Create a .env file based on .env.example");
    }

    return env;
}

const env = loadEnv();
const isWatch = process.argv.includes("--watch");
const outdir = path.join(__dirname, "dist");

// Ensure dist directory exists
if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
}

// Build options with environment variable injection
const buildOptions = {
    entryPoints: {
        content: "./content.ts",
        background: "./background.ts",
    },
    bundle: true,
    outdir,
    format: "iife",
    target: "chrome100",
    minify: !isWatch,
    sourcemap: isWatch,
    define: {
        "process.env.OPENAI_API_KEY": JSON.stringify(env.OPENAI_API_KEY || ""),
    },
};

async function build() {
    try {
        if (isWatch) {
            const ctx = await esbuild.context(buildOptions);
            await ctx.watch();
            console.log("Watching for changes...");
        } else {
            await esbuild.build(buildOptions);
            console.log("Build complete!");
        }

        // Copy static files
        copyStatic();
    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

function copyStatic() {
    // Copy manifest
    fs.copyFileSync("./manifest.json", path.join(outdir, "manifest.json"));

    // Copy popup
    fs.copyFileSync("./popup.html", path.join(outdir, "popup.html"));

    // Copy CSS
    if (!fs.existsSync(path.join(outdir, "styles"))) {
        fs.mkdirSync(path.join(outdir, "styles"), { recursive: true });
    }
    fs.copyFileSync("./styles/content.css", path.join(outdir, "styles", "content.css"));

    // Copy icons
    if (!fs.existsSync(path.join(outdir, "icons"))) {
        fs.mkdirSync(path.join(outdir, "icons"), { recursive: true });
    }
    const iconSizes = ["16", "48", "128"];
    iconSizes.forEach((size) => {
        const iconPath = `./icons/icon${size}.png`;
        if (fs.existsSync(iconPath)) {
            fs.copyFileSync(iconPath, path.join(outdir, "icons", `icon${size}.png`));
        }
    });

    console.log("Static files copied!");
}

build();
