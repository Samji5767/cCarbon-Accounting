import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Dark window background prevents white flash before the web content loads
        window?.backgroundColor = UIColor(red: 11/255, green: 17/255, blue: 32/255, alpha: 1.0)

        // Configure WKWebView after the view hierarchy is fully set up
        DispatchQueue.main.async {
            self.configureWebView()
        }
        return true
    }

    private func configureWebView() {
        guard let bridgeVC = window?.rootViewController as? CAPBridgeViewController,
              let webView = bridgeVC.webView else { return }

        let appBackground = UIColor(red: 11/255, green: 17/255, blue: 32/255, alpha: 1.0)

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

    func applicationWillResignActive(_ application: UIApplication) {}

    func applicationDidEnterBackground(_ application: UIApplication) {}

    func applicationWillEnterForeground(_ application: UIApplication) {}

    func applicationDidBecomeActive(_ application: UIApplication) {}

    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
