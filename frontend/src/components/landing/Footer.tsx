import React from 'react';
import { Separator } from '../ui/separator';
import {
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  MailIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const footerSections = [
  {
    title: "Layanan",
    links: [
      {
        title: "Jual Beli Mobil",
        href: "#",
      },
      {
        title: "Tukar Tambah",
        href: "#",
      },
      {
        title: "Test Drive",
        href: "#",
      },
      {
        title: "Kredit Mobil",
        href: "#",
      },
      {
        title: "Asuransi",
        href: "#",
      },
      {
        title: "Perawatan",
        href: "#",
      },
    ],
  },
  {
    title: "Kategori Mobil",
    links: [
      {
        title: "Hatchback",
        href: "#",
      },
      {
        title: "Sedan",
        href: "#",
      },
      {
        title: "SUV",
        href: "#",
      },
      {
        title: "MPV",
        href: "#",
      },
      {
        title: "Pickup",
        href: "#",
      },
      {
        title: "Mobil Bekas",
        href: "#",
      },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      {
        title: "Tentang Kami",
        href: "#",
      },
      {
        title: "Karir",
        href: "#",
      },
      {
        title: "Berita",
        href: "#",
      },
      {
        title: "Blog",
        href: "#",
      },
      {
        title: "Kontak",
        href: "#",
      },
      {
        title: "Lokasi Showroom",
        href: "#",
      },
    ],
  },
  {
    title: "Bantuan",
    links: [
      {
        title: "FAQ",
        href: "#",
      },
      {
        title: "Panduan Kredit",
        href: "#",
      },
      {
        title: "Layanan Pelanggan",
        href: "#",
      },
      {
        title: "Garansi",
        href: "#",
      },
      {
        title: "Kebijakan Privasi",
        href: "#",
      },
      {
        title: "Syarat & Ketentuan",
        href: "#",
      },
    ],
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 xs:mt-20 bg-white border-t">
      <div className="max-w-screen-xl mx-auto py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-10 px-6">
        <div className="col-span-full xl:col-span-2">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" className="fill-black"/>
              <path
                d="M8 12h16v8H8v-8zm2 2v4h12v-4H10zm-2 10h16v2H8v-2z"
                className="fill-white"
              />
              <circle cx="11" cy="25" r="1.5" className="fill-white"/>
              <circle cx="21" cy="25" r="1.5" className="fill-white"/>
            </svg>
            <span className="text-xl font-bold">Mobilindo</span>
          </div>

          <p className="mt-4 text-gray-600">
            Showroom mobil terpercaya dengan koleksi lengkap dan layanan terbaik untuk kebutuhan kendaraan Anda.
          </p>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <PhoneIcon className="h-4 w-4" />
              <span>+62 21 1234 5678</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MailIcon className="h-4 w-4" />
              <span>info@mobilindo.com</span>
            </div>
          </div>
        </div>

        {footerSections.map(({ title, links }) => (
          <div key={title} className="xl:justify-self-end">
            <h6 className="font-semibold text-black">{title}</h6>
            <ul className="mt-6 space-y-4">
              {links.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    to={href}
                    className="text-gray-600 hover:text-black"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />
      <div className="max-w-screen-xl mx-auto py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6">
        {/* Copyright */}
        <span className="text-gray-600 text-center xs:text-start">
          &copy; {new Date().getFullYear()}{" "}
          <Link to="#" target="_blank">
            Mobilindo Showroom
          </Link>
          . Semua hak dilindungi.
        </span>

        <div className="flex items-center gap-5 text-gray-600">
          <Link to="#" target="_blank">
            <FacebookIcon className="h-5 w-5" />
          </Link>
          <Link to="#" target="_blank">
            <InstagramIcon className="h-5 w-5" />
          </Link>
          <Link to="#" target="_blank">
            <PhoneIcon className="h-5 w-5" />
          </Link>
          <Link to="#" target="_blank">
            <MailIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;