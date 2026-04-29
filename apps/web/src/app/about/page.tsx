import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-[#fcfdfa] min-h-screen font-serif text-[#2a3c24]">
      {/* 1. Hero / Sustainability Values */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-medium mb-4 leading-tight">
          Providing Quality and Innovative Products with Strong Sustainability Value
        </h1>
        <p className="text-lg md:text-xl text-[#4a5c44] mb-12">
          Our Innovative People, Planet, and Profit
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {/* Planet */}
          <div className="bg-[#e9eee4] p-8 rounded-lg shadow-sm border border-[#d9e0d2]">
            <h3 className="text-xl font-semibold mb-4 text-center border-b border-[#d9e0d2] pb-4">Planet</h3>
            <ul className="space-y-4 text-sm text-[#3a4c34] mt-4">
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Menyelamatkan & menghijaukan lingkungan</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Sustainable packaging (100% recyclable)</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Melindungi keanekaragaman hayati</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Mengurangi jejak karbon</span></li>
            </ul>
          </div>
          {/* People */}
          <div className="bg-[#e9eee4] p-8 rounded-lg shadow-sm border border-[#d9e0d2]">
            <h3 className="text-xl font-semibold mb-4 text-center border-b border-[#d9e0d2] pb-4">People</h3>
            <ul className="space-y-4 text-sm text-[#3a4c34] mt-4">
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Memberdayakan petani & produsen lokal</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Kondisi kerja yang adil dan transparan</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Keterlibatan komunitas dalam pengambilan keputusan</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Mendukung UMKM & usaha lokal</span></li>
            </ul>
          </div>
          {/* Profit */}
          <div className="bg-[#e9eee4] p-8 rounded-lg shadow-sm border border-[#d9e0d2]">
            <h3 className="text-xl font-semibold mb-4 text-center border-b border-[#d9e0d2] pb-4">Profit</h3>
            <ul className="space-y-4 text-sm text-[#3a4c34] mt-4">
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Bisnis berkelanjutan & ramah lingkungan</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Menginvestasikan kembali keuntungan ke masyarakat dan lingkungan</span></li>
              <li className="flex items-start"><span className="mr-3 text-[#5b7a4c] font-bold">•</span> <span>Fokus jangka panjang untuk kesejahteraan ekosistem</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Video Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 md:pr-12">
            <h2 className="text-4xl md:text-5xl font-medium leading-tight text-[#2a3c24] mb-4">
              A New Horizon For Skincare.<br/>
              A New Promise For Every Women
            </h2>
          </div>
          <div className="flex-1 w-full relative aspect-video rounded-xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&q=80&w=800" 
              alt="Orangutan" 
              className="object-cover w-full h-full transform hover:scale-105 transition duration-700"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-black/20"></div>
            {/* Video Text Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
               <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center">
                 <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span> Ginabo Eco Journey
               </div>
            </div>
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center group">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer group-hover:bg-red-700 group-hover:scale-110 shadow-lg transition-all duration-300">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Timeline / Journey Section */}
      <section className="py-24 bg-[#4a5c44] text-white my-12 relative overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80" alt="Nature bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-20 text-white">Ginabo Eco-Friendly Journey</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
            {[
              { year: '2014', title: 'The Beginning', desc: 'Launching of Ginabo with our first natural products.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2015', title: 'Reformulation', desc: 'Reformulating with more natural & safe ingredients.', img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2016', title: '#GinaboGoesGreen', desc: '1st campaign advocating for greener beauty practices.', img: 'https://images.unsplash.com/photo-1418065460487-3e41a6c8e1e3?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2017', title: 'Paperless', desc: 'Releasing paperless packaging and reducing waste.', img: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2018', title: 'Love Earth', desc: 'Sustainability campaign "Love Ginabo Love Earth".', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2019', title: 'Eco Packaging', desc: 'Launching our 100% eco-friendly packaging lines.', img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2020', title: 'Protect Wildlife', desc: 'Collaboration to protect endangered wildlife.', img: 'https://images.unsplash.com/photo-1550186980-8700abeb88da?auto=format&fit=crop&q=80&w=200&h=200' },
              { year: '2021', title: 'Zero Waste', desc: 'Empowering zero waste lifestyle across our community.', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=200&h=200' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                 <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border-4 border-white/40 shadow-lg relative z-10 bg-[#4a5c44]">
                    <img src={item.img} alt={item.year} className="w-full h-full object-cover" />
                 </div>
                 <div className="font-bold text-2xl mb-1 text-white">{item.year}</div>
                 <div className="font-semibold text-sm mb-2 text-[#d9e0d2]">{item.title}</div>
                 <p className="text-xs text-white/80 max-w-[200px] mx-auto leading-relaxed">{item.desc}</p>
                 
                 {/* Timeline connecting lines (Desktop) */}
                 {i % 4 !== 3 && (
                   <div className="hidden lg:block absolute top-14 left-[60%] w-[100%] h-[2px] bg-white/30 -z-0"></div>
                 )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MulaiDariMejaRias */}
      <section className="py-20 max-w-6xl mx-auto px-4 border-b border-[#e9eee4]">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 w-full aspect-[4/3] relative rounded-2xl overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" alt="Skincare routine" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-6 md:pl-8">
            <h2 className="text-3xl md:text-4xl font-medium text-[#2a3c24]">#MulaiDariMejaRias</h2>
            <div className="w-16 h-1 bg-[#5b7a4c] rounded-full"></div>
            <p className="text-[#4a5c44] leading-relaxed text-lg">
              Di tahun 2021, Ginabo meluncurkan awareness campaign, '#MulaiDariMejaRias'. Melalui campaign ini, Ginabo mengajak konsumen untuk mulai melakukan langkah kecil untuk bumi yang lebih baik yang dimulai dari meja rias dengan mengumpulkan kemasan kosong Ginabo.
            </p>
            <p className="text-[#4a5c44] leading-relaxed text-lg">
              Inisiatif ini tidak hanya mendukung gaya hidup zero waste, tapi juga membangun komitmen untuk melindungi lingkungan secara berkelanjutan demi masa depan yang lebih baik.
            </p>
          </div>
        </div>
      </section>

      {/* 5. GlowingMilikSemua */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 md:pr-8">
            <h2 className="text-3xl md:text-4xl font-medium text-[#2a3c24]">#GlowingMilikSemua</h2>
            <div className="w-16 h-1 bg-[#5b7a4c] rounded-full"></div>
            <p className="text-[#4a5c44] leading-relaxed text-lg">
              Kami percaya bahwa kecantikan adalah milik semua orang, tidak peduli dari mana mereka berasal atau apa warna kulitnya. Karena itu, kami merayakan keberagaman dan inklusivitas dalam setiap langkah.
            </p>
            <p className="text-[#4a5c44] leading-relaxed text-lg">
              Bagi kami, ini bukan cuma sekedar komitmen pada alam, tetapi juga dedikasi untuk merawat semua orang. Kami bangga dapat menjadi bagian dari perjalanan skincare Anda dan berkomitmen untuk terus menghadirkan inovasi yang inklusif dan berkelanjutan.
            </p>
          </div>
          <div className="flex-1 w-full aspect-[4/3] relative rounded-2xl overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1512496015851-a1c848cb6fc1?auto=format&fit=crop&q=80&w=800" alt="Diverse beauty" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 6. Artikel Section */}
      <section className="py-20 bg-[#fcfdfa]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-medium text-center text-[#2a3c24] mb-4">Artikel</h2>
          <div className="w-24 h-1 bg-[#5b7a4c] rounded-full mx-auto mb-12"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Ginabo x Waste4Change: Bersama Merawat Bumi", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Kolaborasi Ginabo x Rekosistem: Pengelolaan Sampah", img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Ginabo Dukung Komunitas Perempuan Mandiri", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Langkah Hijau Ginabo Untuk Ekosistem", img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Inovasi Packaging Ramah Lingkungan", img: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Zero Waste Living: Mulai Dari Rumah", img: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Program Adopsi Orangutan Ginabo", img: "https://images.unsplash.com/photo-1550186980-8700abeb88da?auto=format&fit=crop&q=80&w=400&h=250" },
              { title: "Membersihkan Pantai Bersama Relawan", img: "https://images.unsplash.com/photo-1618477461853-cf6ed80f04c0?auto=format&fit=crop&q=80&w=400&h=250" },
            ].map((article, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm border border-[#e9eee4]">
                  <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#4a5c44] rounded uppercase tracking-wider shadow-sm">
                    Environment
                  </div>
                </div>
                <h3 className="text-base font-semibold text-[#2a3c24] leading-snug group-hover:text-[#5b7a4c] transition">{article.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
