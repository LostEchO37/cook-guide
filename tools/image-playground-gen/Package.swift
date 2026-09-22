// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "DishImageGen",
  platforms: [.macOS(.v15)],
  products: [
    .executable(name: "dish-image-gen", targets: ["DishImageGen"]),
  ],
  targets: [
    .executableTarget(
      name: "DishImageGen",
      linkerSettings: [
        .linkedFramework("ImagePlayground"),
        .linkedFramework("AppKit"),
        .linkedFramework("CoreGraphics"),
        .linkedFramework("ImageIO"),
      ]
    ),
  ]
)
