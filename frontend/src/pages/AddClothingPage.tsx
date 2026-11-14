// frontend/src/pages/AddClothingPage.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react'; 
import { Upload, Camera, ImageIcon, ScanLine, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

interface ScannedAttributes {
  name: string;
  category: string;
  subcategory: string;
  color: string;
  style_tag: string;
  image_url: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

export default function AddClothingPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedAttributes | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setScanning(true);

      // Switched from localStorage to sessionStorage
      const token = sessionStorage.getItem('stylematch_token');
      const base_url = 'http://127.0.0.1:8000';

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(`${base_url}/api/wardrobe/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Failed to upload.');
        const uploadData = await uploadRes.json();
        const uploadedUrl = uploadData.image_url;

        const scanRes = await fetch(`${base_url}/api/wardrobe/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image_url: uploadedUrl })
        });

        if (!scanRes.ok) throw new Error('Scan failed.');
        const scanData = await scanRes.json();

        setScannedData({
          name: scanData.name,
          category: scanData.category,
          subcategory: scanData.subcategory || '',
          color: scanData.color || '',
          style_tag: scanData.style_tag || 'Casual',
          image_url: uploadedUrl
        });

        setScanning(false);
        setScanComplete(true);

      } catch (err) {
        console.error(err);
        setScanning(false);
        setPreview(null);
        alert('Scanner failed to analyze image. Please ensure you are logged in.');
      }
    }
  };

  const handleSave = async () => {
    if (!scannedData) return;
    setIsSaving(true);

    // Switched from localStorage to sessionStorage
    const token = sessionStorage.getItem('stylematch_token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/wardrobe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: scannedData.name,
          category: scannedData.category,
          subcategory: scannedData.subcategory,
          color: scannedData.color,
          style_tag: scannedData.style_tag,
          image_url: scannedData.image_url
        })
      });

      if (res.ok) {
        navigate('/app/wardrobe');
      } else {
        alert('Failed to save clothing item to your wardrobe.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center">
      <div className="text-center mb-10 w-full">
        <h1 className="text-3xl md:text-4xl font-display font-medium text-white/90 mb-2">Add a new piece.</h1>
        <p className="text-white/60">Upload a photo or take one right now.</p>
      </div>

      <div className="w-full flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-violet-primary/50 transition-colors group cursor-pointer bg-charcoal/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-primary/20 transition transform-gpu">
                <Upload className="w-8 h-8 text-white/50 group-hover:text-violet-light" />
              </div>
              <h3 className="text-2xl font-medium mb-8">Upload Photo</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button variant="secondary" className="flex-1" icon={<Camera className="w-4 h-4"/>}>
                  Take Photo
                </Button>
                <Button variant="secondary" className="flex-1" icon={<ImageIcon className="w-4 h-4"/>}>
                  Device
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col md:flex-row gap-8 items-center md:items-start justify-center"
            >
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                
                {scanning && (
                  <>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <motion.div 
                      className="absolute top-[-100%] left-0 right-0 h-full border-b-2 border-violet-primary shadow-[0_10px_30px_rgba(138,43,226,1)] z-20 bg-gradient-to-b from-transparent to-violet-primary/20 transform-gpu will-change-transform"
                      animate={{ y: ['0%', '200%'] }}
                      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <ScanLine className="w-10 h-10 text-violet-primary mb-4 animate-pulse" />
                        <span className="text-sm font-display tracking-widest text-violet-light bg-black/50 px-4 py-1 rounded-full border border-violet-primary/30 text-center">Analyzing your garment...</span>
                      </div>
                    </div>
                  </>
                )}
                
                {scanComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-4 border-violet-primary rounded-2xl pointer-events-none"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute top-[30%] left-[40%] w-3 h-3 bg-violet-primary rounded-full box-glow" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute top-[60%] left-[50%] w-3 h-3 bg-violet-primary rounded-full box-glow" />
                  </motion.div>
                )}
              </div>

              <div className="w-full max-w-sm">
                <AnimatePresence>
                  {scanComplete && scannedData ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-panel p-6 rounded-2xl"
                    >
                      <div className="flex items-center gap-2 mb-6 text-violet-light">
                        <Check className="w-5 h-5" />
                        <span className="text-sm tracking-wider uppercase font-medium">Scan Complete</span>
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-4 mb-6">
                          <input 
                            type="text" 
                            value={scannedData.name}
                            onChange={(e) => setScannedData({...scannedData, name: e.target.value})}
                            className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-primary"
                          />
                          <select 
                            value={scannedData.category}
                            onChange={(e) => setScannedData({...scannedData, category: e.target.value})}
                            className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-primary"
                          >
                            <option value="Tops">Tops</option>
                            <option value="Bottoms">Bottoms</option>
                            <option value="Outerwear">Outerwear</option>
                            <option value="Shoes">Shoes</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Dresses">Dresses</option> {/* Added Dresses Category Option */}
                          </select>
                          <input 
                            type="text" 
                            placeholder="Color"
                            value={scannedData.color}
                            onChange={(e) => setScannedData({...scannedData, color: e.target.value})}
                            className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-primary"
                          />
                          <input 
                            type="text" 
                            placeholder="Subcategory"
                            value={scannedData.subcategory}
                            onChange={(e) => setScannedData({...scannedData, subcategory: e.target.value})}
                            className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-primary"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-medium mb-6">{scannedData.name}</h3>
                          
                          <motion.div 
                            className="space-y-4 mb-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                          >
                            <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-white/50">Category</span>
                              <span className="font-medium">{scannedData.category}</span>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-white/50">Color</span>
                              <span className="font-medium flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-violet-primary shadow-[0_0_10px_rgba(138,43,226,0.8)]"></span> {scannedData.color}
                              </span>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-white/50">Subcategory</span>
                              <span className="font-medium">{scannedData.subcategory || 'None'}</span>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex justify-between">
                              <span className="text-white/50">Style tag</span>
                              <span className="font-medium text-violet-light">{scannedData.style_tag}</span>
                            </motion.div>
                          </motion.div>
                        </>
                      )}

                      <div className="flex flex-col gap-3">
                        <Button 
                          className="w-full flex items-center justify-center gap-2" 
                          onClick={handleSave}
                          disabled={isSaving}
                          icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4"/>}
                        >
                          {isSaving ? 'Saving...' : 'Looks Right'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? 'Done Editing' : 'Edit Details'}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[300px] flex items-center justify-center text-white/30 border border-dashed border-white/10 rounded-2xl p-6 text-center">
                      Analysis results will appear here...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}