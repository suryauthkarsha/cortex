import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, ArrowLeft, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InfographicData } from '@/lib/gemini';

interface InfographicDisplayProps {
  data: InfographicData;
  onBack: () => void;
}

export function InfographicDisplay({ data, onBack }: InfographicDisplayProps) {
  const downloadAsImage = () => {
    const element = document.getElementById('infographic-content');
    if (!element) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = data.colorScheme[0];
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(data.title, 60, 80);

    ctx.fillStyle = data.colorScheme[1];
    ctx.font = '28px sans-serif';
    ctx.fillText(data.subtitle, 60, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    let yPos = 200;
    data.concepts.forEach((concept, i) => {
      ctx.fillStyle = concept.color;
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${i + 1}. ${concept.title}`, 60, yPos);
      
      ctx.fillStyle = '#cccccc';
      ctx.font = '14px sans-serif';
      yPos += 30;
      ctx.fillText(concept.description, 60, yPos);
      yPos += 40;
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${data.title.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById('infographic-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2,
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${data.title.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full overflow-y-auto pr-4 pb-8 custom-scrollbar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadAsPDF}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 hover:bg-neutral-700/60 border border-white/20 hover:border-white/40 text-white rounded-full font-semibold transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={downloadAsImage}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 hover:bg-neutral-700/60 border border-white/20 hover:border-white/40 text-white rounded-full font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Image
          </button>
        </div>
      </div>

      {/* Main Infographic */}
      <div id="infographic-content" className="bg-gradient-to-br from-neutral-900/80 to-black border border-white/10 rounded-3xl p-8 space-y-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2 border-b border-white/10 pb-6"
        >
          <h2 className="text-4xl font-bold text-white">
            {data.title}
          </h2>
          <p className="text-neutral-400 text-lg">{data.subtitle}</p>
        </motion.div>

        {/* Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.concepts.map((concept, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.1 }}
              className="bg-neutral-800/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
              style={{ borderLeftColor: concept.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: concept.color }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{concept.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{concept.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key Stats */}
        {data.keyStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t border-white/10 pt-6 space-y-3"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Key Takeaways
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.keyStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.1 }}
                  className="bg-neutral-800/30 border border-primary/20 rounded-lg p-4 text-center"
                >
                  <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-sm text-neutral-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-6"
        >
          <p className="text-neutral-100 leading-relaxed">{data.summary}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
