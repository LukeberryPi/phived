import AppKit
import SwiftUI

struct PhivedIcon: View {
    let name: String
    var size: CGFloat = 20

    var body: some View {
        if let image = Self.image(named: name) {
            Image(nsImage: image)
                .resizable()
                .renderingMode(.template)
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
        }
    }

    private static func image(named name: String) -> NSImage? {
        guard let url = AppResources.url(forResource: name, withExtension: "svg") else {
            return nil
        }
        return NSImage(contentsOf: url)
    }
}
