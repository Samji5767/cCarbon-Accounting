import SwiftUI

// MARK: - App Icon View
// Renders the cCarbon app icon at any size (20pt–1024pt).
// Color(hex:) and LeafShape are defined in CarbonLogoView.swift.

struct AppIconView: View {
    let size: CGFloat

    var body: some View {
        ZStack {
            // Radial gradient background: #1a2942 center → #0b1120 edge
            GeometryReader { geo in
                let side = min(geo.size.width, geo.size.height)
                RadialGradient(
                    colors: [Color(hex: "#1a2942"), Color(hex: "#0b1120")],
                    center: .center,
                    startRadius: 0,
                    endRadius: side * 0.7
                )
            }

            IconCenterElement(size: size)

            if size >= 58 {
                IconCO2Badge(size: size)
            }
        }
        .frame(width: size, height: size)
        .clipped()
    }
}

private struct IconCenterElement: View {
    let size: CGFloat

    var body: some View {
        let scale = size / 1024
        ZStack {
            // Thin emerald ring
            Circle()
                .strokeBorder(
                    LinearGradient(
                        colors: [Color(hex: "#10b981"), Color(hex: "#0d9488")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: max(1.5, 28 * scale)
                )
                .frame(width: 680 * scale, height: 680 * scale)

            // Leaf-molecule hybrid: gradient leaf rotated 45°
            LeafShape()
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#10b981"), Color(hex: "#059669")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 400 * scale, height: 400 * scale)
                .rotationEffect(.degrees(-45))

            // Ghost "C" letterform for brand legibility at large sizes
            Text("C")
                .font(.system(size: 220 * scale, weight: .bold, design: .rounded))
                .foregroundStyle(Color(hex: "#0b1120").opacity(0.22))
                .offset(x: 18 * scale, y: 8 * scale)
        }
    }
}

private struct IconCO2Badge: View {
    let size: CGFloat

    var body: some View {
        let scale = size / 1024
        VStack(spacing: 0) {
            Spacer()
            HStack {
                Spacer()
                Text("CO\u{2082}")
                    .font(.system(size: max(8, 76 * scale), weight: .semibold, design: .rounded))
                    .foregroundStyle(Color(hex: "#10b981"))
                    .padding(max(2, 14 * scale))
            }
        }
    }
}

// MARK: - Icon Generator
// Run on a simulator (iOS 16+) to export PNGs to ~/Documents/.
// Then copy them into App/Assets.xcassets/AppIcon.appiconset/.
// To trigger: call IconGenerator.generateAll() once, e.g. from a DEBUG block
// in applicationDidFinishLaunching, then grab the files from the simulator.

@available(iOS 16.0, *)
struct IconGenerator {
    static let sizes: [(name: String, pixels: Int)] = [
        ("icon-40.png",    40),
        ("icon-58.png",    58),
        ("icon-60.png",    60),
        ("icon-80.png",    80),
        ("icon-87.png",    87),
        ("icon-120.png",  120),
        ("icon-180.png",  180),
        ("icon-1024.png", 1024)
    ]

    @MainActor
    static func generateAll() {
        guard let docs = FileManager.default.urls(
            for: .documentDirectory, in: .userDomainMask
        ).first else {
            print("IconGenerator ❌ Documents directory unavailable")
            return
        }
        for entry in sizes {
            let px = CGFloat(entry.pixels)
            let view = AppIconView(size: px)
            let renderer = ImageRenderer(content: view)
            renderer.scale = 1.0
            guard let image = renderer.uiImage, let data = image.pngData() else {
                print("IconGenerator ❌ render failed for \(entry.name)")
                continue
            }
            let url = docs.appendingPathComponent(entry.name)
            do {
                try data.write(to: url)
                print("IconGenerator ✅ \(url.path)")
            } catch {
                print("IconGenerator ❌ \(entry.name): \(error.localizedDescription)")
            }
        }
        print("IconGenerator ✅ Done — copy PNGs from ~/Documents/ into AppIcon.appiconset/")
    }
}

// MARK: - Previews

#Preview("1024pt — squircle") {
    AppIconView(size: 400)
        .clipShape(RoundedRectangle(cornerRadius: 88, style: .continuous))
        .padding()
        .background(Color.black)
}

#Preview("120pt") {
    AppIconView(size: 120)
        .clipShape(RoundedRectangle(cornerRadius: 27, style: .continuous))
        .padding()
        .background(Color.black)
}

#Preview("40pt") {
    AppIconView(size: 40)
        .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
        .padding()
        .background(Color.black)
}
