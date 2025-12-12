try {
    console.log("Require expo/metro-config...");
    require("expo/metro-config");
    console.log("Success.");

    console.log("Require nativewind/metro...");
    require("nativewind/metro");
    console.log("Success.");
} catch (e) {
    console.error("Error:", e);
}
