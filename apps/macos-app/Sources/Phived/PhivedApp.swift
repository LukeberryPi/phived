import AppKit
import CoreText
import SwiftUI

@main
@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let store = TaskStore()
    private var window: NSWindow!

    static func main() {
        if ProcessInfo.processInfo.environment["PHIVED_SELF_TEST"] == "1" {
            DomainSelfChecks.run()
            return
        }
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.run()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        registerFonts()
        let rootView = AppRootView()
            .environmentObject(store)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1180, height: 760),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = "phived, the anti-procrastination to-do list"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.standardWindowButton(.closeButton)?.isHidden = true
        window.standardWindowButton(.miniaturizeButton)?.isHidden = true
        window.standardWindowButton(.zoomButton)?.isHidden = true
        window.minSize = NSSize(width: 760, height: 560)
        window.contentView = NSHostingView(rootView: rootView)
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApplication.shared.activate(ignoringOtherApps: true)
        configureMenu()
        if ProcessInfo.processInfo.environment["PHIVED_SNAPSHOT_STATE"] == "hotkeys" {
            NotificationCenter.default.post(name: .showHotkeys, object: nil)
        }
        renderSnapshotIfRequested()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    private func configureMenu() {
        let mainMenu = NSMenu()
        let appItem = NSMenuItem()
        mainMenu.addItem(appItem)

        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "About Phived", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Quit Phived", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu

        let tasksItem = NSMenuItem()
        mainMenu.addItem(tasksItem)
        let tasksMenu = NSMenu(title: "Tasks")
        let shortcuts = NSMenuItem(title: "Show Keyboard Shortcuts", action: #selector(showHotkeys), keyEquivalent: "/")
        shortcuts.keyEquivalentModifierMask = .command
        tasksMenu.addItem(shortcuts)
        let clear = NSMenuItem(title: "Clear Canvas", action: #selector(clearTasks), keyEquivalent: "\u{8}")
        clear.keyEquivalentModifierMask = [.command, .shift]
        tasksMenu.addItem(clear)
        tasksItem.submenu = tasksMenu
        NSApplication.shared.mainMenu = mainMenu
    }

    @objc private func showHotkeys() {
        NotificationCenter.default.post(name: .showHotkeys, object: nil)
    }

    @objc private func clearTasks() {
        store.requestClearCanvas()
    }

    private func registerFonts() {
        AppResources.fontNames.forEach { name in
            guard let url = AppResources.url(forResource: name, withExtension: "ttf") else { return }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }

    private func renderSnapshotIfRequested() {
        guard let path = ProcessInfo.processInfo.environment["PHIVED_SNAPSHOT_PATH"] else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard
                let view = self?.window.contentView,
                let bitmap = view.bitmapImageRepForCachingDisplay(in: view.bounds)
            else {
                NSApplication.shared.terminate(nil)
                return
            }
            view.cacheDisplay(in: view.bounds, to: bitmap)
            if let data = bitmap.representation(using: .png, properties: [:]) {
                try? data.write(to: URL(fileURLWithPath: path))
            }
            NSApplication.shared.terminate(nil)
        }
    }
}

struct AppRootView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var systemScheme

    var body: some View {
        ContentView()
            .environment(\.palette, .current(resolvedScheme))
            .preferredColorScheme(preferredColorScheme)
    }

    private var preferredColorScheme: ColorScheme? {
        switch store.theme {
        case .system: nil
        case .dark: .dark
        case .light: .light
        }
    }

    private var resolvedScheme: ColorScheme {
        switch store.theme {
        case .system: systemScheme
        case .dark: .dark
        case .light: .light
        }
    }
}

extension Notification.Name {
    static let showHotkeys = Notification.Name("showHotkeys")
}
