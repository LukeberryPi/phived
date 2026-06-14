// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "Phived",
    platforms: [.macOS(.v14)],
    products: [.executable(name: "Phived", targets: ["Phived"])],
    targets: [
        .executableTarget(name: "Phived", resources: [.process("Resources")]),
        .testTarget(name: "PhivedTests", dependencies: ["Phived"])
    ]
)
