import Foundation

enum AppResources {
    static let fontNames = ["DMSans-Light", "DMSans-Regular", "DMSans-Medium", "DMSans-Bold"]
    static let iconNames = [
        "clock",
        "close",
        "computer",
        "drag-vertical",
        "keyboard",
        "moon",
        "question",
        "sun",
        "trash"
    ]

    static func url(forResource name: String, withExtension fileExtension: String) -> URL? {
        Bundle.module.url(forResource: name, withExtension: fileExtension)
    }

    static var requiredResourcesAreAvailable: Bool {
        fontNames.allSatisfy { url(forResource: $0, withExtension: "ttf") != nil } &&
            iconNames.allSatisfy { url(forResource: $0, withExtension: "svg") != nil }
    }
}
