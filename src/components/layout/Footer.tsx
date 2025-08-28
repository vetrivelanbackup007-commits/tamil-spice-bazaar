export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} Tamil Spice Bazaar. All rights reserved.</p>
          <p>Crafted with ❤ in Tamil Nadu. Spice responsibly 🌶️</p>
        </div>
      </div>
    </footer>
  );
}
