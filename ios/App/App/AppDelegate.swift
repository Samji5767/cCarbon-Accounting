import UIKit
import Capacitor
import WebKit
import SwiftUI

// MARK: - UIColor Hex Extension

extension UIColor {
    convenience init(hex: String, alpha: CGFloat = 1.0) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r: UInt64
        let g: UInt64
        let b: UInt64
        let a: CGFloat
        switch hex.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
            a = alpha
        case 8:
            // AARRGGBB format
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
            a = CGFloat((int >> 24) & 0xFF) / 255.0
        default:
            (r, g, b) = (0, 0, 0)
            a = alpha
        }
        self.init(
            red: CGFloat(r) / 255,
            green: CGFloat(g) / 255,
            blue: CGFloat(b) / 255,
            alpha: a
        )
    }
}

// MARK: - App Delegate

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var splashViewController: UIViewController?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Dark window background prevents white flash before web content loads
        window?.backgroundColor = UIColor(hex: "#0b1120")

        // Emerald tint for all native iOS controls (switches, sliders, links)
        window?.tintColor = UIColor(hex: "#10b981")

        // Branded splash overlay while WKWebView hydrates
        showSplashOverlay()

        // Configure WKWebView after the view hierarchy is fully set up
        DispatchQueue.main.async {
            self.configureWebView()
        }
        return true
    }

    // MARK: - Splash Overlay

    private func showSplashOverlay() {
        guard let window = window else { return }

        let splashContent = ZStack {
            Color(hex: "#0b1120").ignoresSafeArea()
            CarbonLogoView(size: 80, showLabel: true)
        }
        let splashVC = UIHostingController(rootView: splashContent)
        splashVC.view.backgroundColor = UIColor(hex: "#0b1120")
        splashVC.view.frame = window.bounds
        splashVC.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        window.addSubview(splashVC.view)
        splashViewController = splashVC

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
            UIView.animate(withDuration: 0.4, animations: {
                splashVC.view.alpha = 0
            }, completion: { _ in
                splashVC.view.removeFromSuperview()
                self?.splashViewController = nil
            })
        }
    }

    // MARK: - Web View Configuration

    private func configureWebView() {
        guard let bridgeVC = window?.rootViewController as? CAPBridgeViewController,
              let webView = bridgeVC.webView else { return }

        let appBackground = UIColor(hex: "#0b1120")

        // Match app background so there is zero white flash on content load
        webView.backgroundColor = appBackground
        webView.isOpaque = false

        // Disable rubber-band overscroll — feels wrong in a native shell
        webView.scrollView.bounces = false

        // Hide scroll indicators for a cleaner native appearance
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false

        // Inject script to disable text selection and long-press context menus
        let noSelectScript = """
            (function() {
                var style = document.createElement('style');
                style.textContent = '* { -webkit-user-select: none !important; user-select: none !important; }';
                document.head.appendChild(style);
                document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);
                document.addEventListener('selectstart', function(e) { e.preventDefault(); }, true);
            })();
        """
        let userScript = WKUserScript(
            source: noSelectScript,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        webView.configuration.userContentController.addUserScript(userScript)
    }

    // MARK: - App Lifecycle

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(
            application, continue: userActivity, restorationHandler: restorationHandler
        )
    }
}
