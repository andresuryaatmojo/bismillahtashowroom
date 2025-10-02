import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardBody className="p-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-8xl font-bold text-primary-600 mb-4">404</h1>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Halaman Tidak Ditemukan
              </h2>
              <p className="text-gray-600 mb-8">
                Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                Mungkin halaman telah dipindahkan atau URL yang Anda masukkan salah.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4"
            >
              <RouterLink to="/">
                <Button color="primary" size="lg" className="w-full">
                  Kembali ke Beranda
                </Button>
              </RouterLink>
              
              <RouterLink to="/catalog">
                <Button variant="bordered" size="lg" className="w-full">
                  Lihat Katalog Mobil
                </Button>
              </RouterLink>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8"
            >
              <svg
                className="w-32 h-32 mx-auto text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;