import SwiftUI

struct Palette {
    let canvas: Color
    let surface: Color
    let line: Color
    let edge: Color
    let ink: Color
    let muted: Color
    let accent: Color
    let shadow: Color

    static func current(_ scheme: ColorScheme) -> Self {
        scheme == .dark
            ? Self(
                canvas: Color(hex: 0x0A0C10),
                surface: Color(hex: 0x14171D),
                line: Color(hex: 0x262B34),
                edge: Color(hex: 0x363D49),
                ink: Color(hex: 0xE2E5EA),
                muted: Color(hex: 0x8B919D),
                accent: Color(hex: 0x155E75),
                shadow: .clear
            )
            : Self(
                canvas: Color(hex: 0xF9FAFB),
                surface: .white,
                line: Color(hex: 0xA1A1AA),
                edge: .black,
                ink: .black,
                muted: Color(hex: 0x71717A),
                accent: Color(hex: 0x7DD3FC),
                shadow: Color(hex: 0x080811)
            )
    }
}

private struct PaletteKey: EnvironmentKey {
    static let defaultValue = Palette.current(.light)
}

extension EnvironmentValues {
    var palette: Palette {
        get { self[PaletteKey.self] }
        set { self[PaletteKey.self] = newValue }
    }
}

extension Color {
    init(hex: UInt) {
        self.init(
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 8) & 0xff) / 255,
            blue: Double(hex & 0xff) / 255
        )
    }
}
