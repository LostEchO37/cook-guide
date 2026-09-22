import AppKit
import ImageIO
import ImagePlayground
import UniformTypeIdentifiers

@available(macOS 15.4, *)
@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
  var prompt = ""
  var outputPath = ""
  var styleName = "illustration"
  var exitCode: Int32 = 0

  func applicationDidFinishLaunching(_ notification: Notification) {
    NSApp.setActivationPolicy(.regular)
    NSApp.activate(ignoringOtherApps: true)

    Task {
      defer { NSApp.terminate(nil) }
      do {
        let creator = try await ImageCreator()
        let style: ImagePlaygroundStyle = switch styleName.lowercased() {
        case "animation": .animation
        case "sketch": .sketch
        case "emoji": .emoji
        default: .illustration
        }

        fputs("Generating with Image Playground (\(styleName))…\n", stderr)
        let stream = creator.images(
          for: [.text(prompt)],
          style: style,
          limit: 1
        )

        var saved = false
        for try await created in stream {
          let url = URL(fileURLWithPath: outputPath)
          try savePNG(cgImage: created.cgImage, to: url)
          print(url.path)
          saved = true
          break
        }

        if !saved {
          fputs("No image returned.\n", stderr)
          self.exitCode = 3
        }
      } catch {
        fputs("Error: \(error.localizedDescription)\n", stderr)
        self.exitCode = 1
      }
    }
  }

  func applicationWillTerminate(_ notification: Notification) {
    exit(exitCode)
  }
}

func savePNG(cgImage: CGImage, to url: URL) throws {
  let dir = url.deletingLastPathComponent()
  try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
  guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    throw NSError(domain: "DishImageGen", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not create PNG destination"])
  }
  CGImageDestinationAddImage(dest, cgImage, nil)
  if !CGImageDestinationFinalize(dest) {
    throw NSError(domain: "DishImageGen", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not write PNG"])
  }
}

let args = CommandLine.arguments
guard args.count >= 3 else {
  fputs("Usage: dish-image-gen <output.png> <prompt...>\n", stderr)
  exit(64)
}

if #available(macOS 15.4, *) {
  let delegate = AppDelegate()
  delegate.outputPath = args[1]
  delegate.prompt = args.dropFirst(2).joined(separator: " ")
  delegate.styleName = ProcessInfo.processInfo.environment["DISH_IMAGE_STYLE"] ?? "illustration"

  let app = NSApplication.shared
  app.delegate = delegate
  app.run()
} else {
  fputs("Requires macOS 15.4+ with Apple Intelligence.\n", stderr)
  exit(2)
}
