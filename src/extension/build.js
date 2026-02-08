const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const isWatch = process.argv.includes("--watch");
const outdir = path.join(__dirname, "dist");

// Ensure dist directory exists
if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
}

// Build options
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
