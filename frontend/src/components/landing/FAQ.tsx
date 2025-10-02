import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '../ui/accordion';
import { cn } from '../../lib/utils';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { PlusIcon } from 'lucide-react';

const faq = [
  {
    question: "Apakah mobil di Mobilindo bergaransi?",
    answer:
      "Ya, semua mobil di Mobilindo dilengkapi dengan garansi resmi. Garansi mencakup mesin, transmisi, dan komponen utama lainnya sesuai dengan ketentuan yang berlaku.",
  },
  {
    question: "Bagaimana proses kredit mobil di Mobilindo?",
    answer:
      "Proses kredit sangat mudah dan cepat. Anda hanya perlu menyiapkan dokumen seperti KTP, KK, slip gaji, dan rekening koran. Tim kami akan membantu proses pengajuan ke berbagai bank rekanan.",
  },
  {
    question: "Apakah bisa tukar tambah mobil lama?",
    answer:
      "Tentu saja! Kami menerima tukar tambah mobil lama Anda. Tim penaksir kami akan memberikan harga terbaik untuk mobil lama Anda sebagai down payment mobil baru.",
  },
  {
    question: "Berapa lama proses pengiriman mobil?",
    answer:
      "Untuk mobil ready stock, pengiriman bisa dilakukan dalam 1-3 hari kerja. Untuk mobil indent, waktu pengiriman sekitar 2-4 minggu tergantung ketersediaan dari pabrik.",
  },
  {
    question: "Apakah ada layanan test drive?",
    answer:
      "Ya, kami menyediakan layanan test drive gratis. Anda bisa merasakan langsung performa dan kenyamanan mobil sebelum memutuskan untuk membeli.",
  },
  {
    question: "Bagaimana cara menghubungi customer service?",
    answer:
      "Anda bisa menghubungi kami melalui telepon, WhatsApp, atau datang langsung ke showroom. Tim customer service kami siap melayani Anda setiap hari dari pukul 08.00-17.00 WIB.",
  },
];

const FAQ: React.FC = () => {
  return (
    <div id="faq" className="w-full max-w-screen-xl mx-auto py-8 xs:py-16 px-6">
      <h2 className="md:text-center text-3xl xs:text-4xl md:text-5xl !leading-[1.15] font-bold tracking-tighter">
        Pertanyaan yang Sering Diajukan
      </h2>
      <p className="mt-1.5 md:text-center xs:text-lg text-gray-600">
        Jawaban cepat untuk pertanyaan umum tentang layanan dan produk kami.
      </p>

      <div className="min-h-[550px] md:min-h-[320px] xl:min-h-[300px]">
        <Accordion
          type="single"
          collapsible
          className="mt-8 space-y-4 md:columns-2 gap-4"
        >
          {faq.map(({ question, answer }, index) => (
            <AccordionItem
              key={question}
              value={`question-${index}`}
              className="bg-gray-50 py-1 px-4 rounded-xl border-none !mt-0 !mb-4 break-inside-avoid"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                  className={cn(
                    "flex flex-1 items-center justify-between py-4 font-semibold tracking-tight transition-all hover:underline [&[data-state=open]>svg]:rotate-45",
                    "text-start text-lg"
                  )}
                >
                  {question}
                  <PlusIcon className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionContent className="text-[15px]">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;