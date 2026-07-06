// Disable console.log in production environments to keep the browser console clean and secure
if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && !window.location.hostname.startsWith("192.168.")) {
    console.log = () => {};
}

// =============================================
// SCROLL LOCK UTILITY (Medium-style)
// Prevents the page from jumping to top when
// overlays open by using position:fixed + top offset.
// =============================================
let _scrollLockDepth = 0;
let _savedScrollY = 0;

function lockBodyScroll() {
    if (_scrollLockDepth === 0) {
        _savedScrollY = window.scrollY || window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${_savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
    }
    _scrollLockDepth++;
}

function unlockBodyScroll() {
    if (_scrollLockDepth > 0) {
        _scrollLockDepth--;
    }
    if (_scrollLockDepth === 0) {
        const savedY = _savedScrollY;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, savedY);
        _savedScrollY = 0;
    }
}

// Application State & Seed Data
const DEFAULT_ARTICLES = [
    {
        id: "manset-1",
        title: "Mürekkep Manifestosu: Yeni Nesil Bir Edebiyat Akımı",
        subtitle: "Genç kalemlerin sesi, edebiyatın yeni nefesi olmak amacıyla yola çıkan Mürekkep, dijital dünyanın sunduğu özgürlük alanını klasik gazete estetiğiyle birleştiriyor.",
        author: "Mürekkep Yayın Kurulu",
        category: "manset",
        image: "assets/typewriter_birds.webp",
        date: "22 Mayıs 2026",
        readTime: "5 dk okuma",
        claps: 342,
        comments: [],
        content: `
            <p>Edebiyat, insanlığın var oluşundan bu yana duygu ve düşünceleri aktarmanın en asil yolu olmuştur. Ancak zaman akıp giderken, bu aktarımın araçları da değişiyor. Bir zamanlar taş tabletlere kazınan, ardından parşömenlere yazılan ve matbaanın icadıyla kitlelere ulaşan edebi sözcükler, günümüzde dijital ekranların piksellerinde yeniden hayat buluyor.</p>
            <p>Bugün tanıklık ettiğimiz şey, yalnızca fiziksel bir format değişikliği değildir. Edebiyatın kendisi biçim değiştiriyor. "Genç Kalemler" olarak adlandırdığımız yeni nesil yazarlar, internetin sunduğu özgürlük alanını kullanarak sınırları aşan, etkileşimli ve dinamik bir edebiyat akımının temellerini atıyorlar. Mürekkep, bu yeni neslin gür sesi olmak, onların heyecanını ve arayışını dijital bir gazetede bir araya getirmek amacıyla kuruldu.</p>
            <blockquote>"Dijitalleşme edebiyatı öldürmüyor; aksine, onu kütüphanelerin tozlu raflarından çıkarıp hayatın tam merkezine, ekranlarımıza taşıyarak demokratikleştiriyor."</blockquote>
            <p>Bu hareketin bir parçası olmak, yalnızca yazmak değil, aynı zamanda okurla doğrudan bir bağ kurmaktır. Medium ve T24 gibi çağdaş platformların getirdiği minimalist ve odaklı okuma kültürüyle birleşen klasik gazete estetiğimiz, edebiyatı hızlı tüketim nesnesi olmaktan kurtarıp hak ettiği saygınlığa geri döndürmeyi hedefliyor. Kalemimiz dijital de olsa, mürekkebimiz her zaman taze kalacaktır.</p>
        `
    },
    {
        id: "kitap-1",
        title: "İnce Memed Neden Hâlâ Güncel?",
        subtitle: "Yaşar Kemal'in ölümsüz eseri İnce Memed, aradan geçen yıllara rağmen toplumsal adalet arayışına ışık tutmaya devam ediyor.",
        author: "Selim Çetin",
        category: "kitap",
        image: "assets/ince_memed_cover.webp",
        date: "18 Mayıs 2026",
        readTime: "7 dk okuma",
        claps: 128,
        comments: [],
        content: `
            <p>Yaşar Kemal’in dört ciltlik devasa eseri <em>İnce Memed</em>, Türk edebiyatının şüphesiz en parlak taçlarından biridir. Çukurova'nın sıcağını, dikenli yollarını ve sömürüye başkaldıran bir köylünün destansı öyküsünü anlatan bu eser, yazılışından yetmiş yılı aşkın bir süre geçmesine rağmen neden hâlâ taze ve güncel?</p>
            <p>Bunun yanıtı, romanın evrensel temasında gizlidir: İnsanın adalet arayışı ve haksızlığa karşı direniş hakkı. Memed, Abdi Ağa’nın zulmüne karşı dağa çıktığında, sadece kendi intikamı için değil; toprağı ellerinden alınmış, insanlığı hiçe sayılmış tüm köylülerin hakları için dövüşür. Bu bağlamda, İnce Memed yerel bir eşkıya hikayesinin çok ötesinde, evrensel bir özgürlük manifestosudur.</p>
            <p>Yaşar Kemal'in doğa tasvirleri ve insan ruhunun derinliklerine nüfuz eden dili, eseri zamansız kılar. Romanı bugün okuduğumuzda bile Çukurova’nın kokusunu içimize çekebilir, Memed’in yüreğindeki korkuyu ve cesareti aynı anda hissedebiliriz. Güçlünün zayıfı ezdiği her düzende, İnce Memed hep güncel kalacak ve ezilenlerin sesi olmaya devam edecektir.</p>
        `
    },
    {
        id: "deneme-1",
        title: "Gürültü Çağında Sessiz Kalabilmek",
        subtitle: "Her yer konuşuyor, herkes bir şeyler söylüyor. Peki ya susmanın değeri? İç sesimizi duyabilmek için gürültüden uzaklaşmak neden bu kadar zor?",
        author: "Can Özkan",
        category: "deneme",
        image: "assets/quiet_lake.webp",
        date: "15 Mayıs 2026",
        readTime: "5 dk okuma",
        claps: 245,
        comments: [],
        content: `
            <p>21. yüzyıl, tarihin en gürültülü çağı olarak kayıtlara geçiyor. Bu gürültü sadece sokaklardaki araba sesleri, korna sesleri veya inşaat patırtıları değil; zihinlerimizi durmaksızın işgal eden dijital bir gürültüdür. Bildirimler, videolar, tweetler, podcastler ve bitmek bilmeyen haber akışları... Her an bir bilgiye, bir sese maruz kalıyoruz.</p>
            <p>Peki, bu kargaşanın içinde kendi özgün düşüncelerimizi nasıl üretebiliriz? Sessizlik, sadece sesin yokluğu değil, zihnin kendi kendisiyle baş başa kalabilme yeteneğidir. Edebiyat, tam da bu sessizlik topraklarında yeşerir. Bir yazarın kelimeleri kağıda dökebilmesi için önce dış dünyanın gürültüsünü kısmayı öğrenmesi gerekir.</p>
            <blockquote>"Sessizlik, zayıflık değil; zihnin kendi gücünü topladığı en derin eylemdir."</blockquote>
            <p>Modern insan susmaktan korkuyor; çünkü sustuğunda yüzleşmek zorunda kalacağı kendi boşluğundan çekiniyor. Ancak derin okumalar yapmak, edebi bir esere nüfuz etmek ve yazmak sessizliği göze almayı gerektirir. Gürültü çağında sessiz kalabilmek, ruhu korumanın ve edebi direnişin ilk adımıdır.</p>
        `
    },
    {
        id: "roportaj-1",
        title: "Zeynep Arslan: \"Yazmak, Kendime Açtığım En Uzun Mektup\"",
        subtitle: "Genç yazar Zeynep Arslan ile yazarlık serüvenini, ilham kaynaklarını ve dijital dünyada edebiyatı konuştuk.",
        author: "Mürekkep Röportaj",
        category: "roportaj",
        image: "assets/author_zeynep.webp",
        date: "20 Mayıs 2026",
        readTime: "8 dk okuma",
        claps: 215,
        comments: [],
        content: `
            <p><strong>Mürekkep:</strong> Zeynep Hanım merhaba. Yeni kitabınız büyük ilgi gördü. Yazmak sizin için ne ifade ediyor?</p>
            <p><strong>Zeynep Arslan:</strong> Merhaba. Yazmak benim için kendime açtığım en uzun mektuptur. Kendimi keşfetme, dünyayla ve insanlarla bağ kurma biçimim. Kağıt üzerinde kendime yalan söyleyemiyorum, bu yüzden yazmak benim için en saf dürüstlük alanı.</p>
            <p><strong>Mürekkep:</strong> Dijital edebiyat hareketine bakışınız nasıl? Mürekkep gibi dijital gazeteler edebi üretime katkı sağlıyor mu?</p>
            <p><strong>Zeynep Arslan:</strong> Kesinlikle sağlıyor. Edebiyatın dar kalıplardan çıkıp gençlere, geniş kitlelere ulaşması gerekiyor. Dijital dünya bunu çok hızlı yapıyor. Eskiden dergilere yazı göndermek, yayınlatmak aylar sürerdi. Şimdi ise Mürekkep gibi platformlarda anında okura ulaşıyorsunuz. Üstelik okurdan anında yorum alabilmek yazarı çok besleyen bir şey.</p>
            <p><strong>Mürekkep:</strong> Yazmaya yeni başlayan genç kalemlere tavsiyeleriniz nelerdir?</p>
            <p><strong>Zeynep Arslan:</strong> Öncelikle bolca okumaları ve gürültüden uzaklaşıp kendi seslerini bulmaya çalışmaları gerek. Bir de yazmaktan korkmasınlar. İlk taslaklar her zaman kötüdür, önemli olan o ham metni sabırla işlemek ve yazmayı bir disiplin haline getirmektir.</p>
        `
    },
    {
        id: "siir-1",
        title: "İsimsiz Bir Bahar Sabahı",
        subtitle: "Doğanın uyanışında saklı olan küçük detaylara yazılmış derin bir şiir.",
        author: "Melike Nur Özkan",
        category: "siir",
        image: "assets/poetry_flowers.webp",
        date: "22 Mayıs 2026",
        readTime: "3 dk okuma",
        claps: 184,
        comments: [],
        content: `
            <p class="poem-text">Bir sabah uyanırsın ansızın,<br>
            Pencere aralıktır hâlâ.<br>
            İçeri süzülen ışık değil,<br>
            Belki de dünün yarım kalmışlığıdır.</p>
            
            <p class="poem-text">Kuşlar bile daha yorgun bugün,<br>
            Şiirlerim sessiz, kelimeler saklı...<br>
            Ama sen gülümse,<br>
            Belki geç kalmış bir bahardır bu.</p>
            
            <p class="poem-text">Mürekkep akar, kağıt solar ama<br>
            Yüreğe dokunan o fısıltı kalır.<br>
            İsimsiz bir bahar sabahında,<br>
            Gökyüzü yeniden maviye boyanır.</p>
        `
    },
    {
        id: "oyku-1",
        title: "Yağmurdan Sonra",
        subtitle: "Bazı günler vardır, şehir bile susar. Yağmur diner, ama ıslak kaldırımlar geçmişi hatırlatır insana...",
        author: "Elif Su Yıldız",
        category: "oyku",
        image: "assets/rainy_window.webp",
        date: "21 Mayıs 2026",
        readTime: "10 dk okuma",
        claps: 162,
        comments: [],
        content: `
            <p>Yağmur, Ankara’nın gri caddelerine bereketiyle değil, hüznüyle inmişti o gün. Saatlerce kesintisiz yağan yağmur, ikindi vakti yerini ılık bir esintiye bıraktı. Gökyüzü hala kurşuni renkliydi ama bulutların arasından sızan cılız güneş ışınları, yoldaki su birikintilerinde altın sarısı yansımalar oluşturuyordu.</p>
            <p>Ahmet, yakasını kaldırdığı trençkotunun ceplerine ellerini sokarak yürüyordu. Adımları düzensizdi. Islak kaldırımlarda yürürken çıkan sesler, ona çok eski bir şarkının ritmini hatırlatıyordu. Her yağmurdan sonra bu caddede yürür, havaya yayılan o toprak kokusunu içine çekerdi. O koku, geçmişin, çocukluğun ve kaybedilmiş zamanların kokusuydu.</p>
            <p>Köşedeki sahafın önüne geldiğinde durdu. Islak brandadan süzülen damlalar, dışarıda duran ucuz kitapların üzerine gelmesin diye sahaf amca kitapları içeri taşımıştı. Vitrinde sadece eski bir İstanbul fotoğrafı duruyordu. Fotoğraftaki tramvay rayları da tıpkı şu an yürüdüğü cadde gibi ıslaktı. Şehir değişiyor, insanlar değişiyor ama yağmurdan sonraki o yalnızlık hissi hiç değişmiyordu.</p>
        `
    },
    {
        id: "kose-yazilari-1",
        title: "Edebiyat ve Yalnızlık Üzerine",
        subtitle: "Yazarlık, yazarın en eski dostudur belki de. Ama her dost gibi o da bazen insana ağır gelir.",
        author: "Mehmet Ali Demir",
        category: "kose-yazilari",
        image: "assets/author_mehmet.webp",
        date: "19 Mayıs 2026",
        readTime: "6 dk okuma",
        claps: 195,
        comments: [],
        content: `
            <p>Yalnızlık, yaratıcı zihnin hem sığınağı hem de zindanıdır. Edebiyat tarihi incelendiğinde, büyük eserlerin çoğunun derin yalnızlık dönemlerinde doğduğu görülür. Kafka’nın odası, Proust’un mantar kaplı duvarları, Emily Dickinson’ın evinden dışarı adım atmaması... Hepsi bilinçli bir inzivanın ürünüdür.</p>
            <p>Ancak bu yalnızlık, modern dünyanın anladığı cinsten bir 'yalnız kalma' durumu değildir. Bu, kalabalıklar içindeyken bile hissedilen, zihinsel bir gurbettir. Yazar, etrafındaki insanları gözlemlerken bile onlardan uzaktadır; çünkü o anı yaşamaz, o anı sonradan yazmak üzere kaydeder.</p>
            <p>Yazmak, bu yalnızlığı paylaşma çabasıdır aslında. Kendi içine dönen insan, orada bulduğu incileri başkalarına sunarak yalnızlığını hafifletmek ister. Mürekkep, işte bu bireysel yalnızlıkların dijital bir ağda buluştuğu, edebi bir dayanışma alanı yaratıyor. Yazarken yalnızız, evet; ama okurken hiçbirimiz yalnız değiliz.</p>
        `
    },
    {
        id: "haber-1",
        title: "Edebiyat Dünyasından Son Haberler",
        subtitle: "Fuar kapıları, edebiyat ödülleri ve genç yazarlar için fon destekleri.",
        author: "Mürekkep Kültür Haber",
        category: "haber",
        image: "assets/typewriter_birds.webp",
        date: "22 Mayıs 2026",
        readTime: "3 dk okuma",
        claps: 92,
        comments: [],
        content: `
            <h3>İstanbul Kitap Fuarı Kapılarını Açtı</h3>
            <p>Bu yıl 41. kez düzenlenen İstanbul Kitap Fuarı, yüzlerce yayınevi ve binlerce yazarın katılımıyla kapılarını kitapseverlere açtı. Fuar süresince imza günleri, paneller ve edebi söyleşiler gerçekleştirilecek. Ana temanın 'Çocuk Edebiyatı ve Gelecek' olduğu fuarda genç yazarlara ayrılan özel stantlar yoğun ilgi görüyor.</p>
            
            <h3>2024 Cevdet Kudret Edebiyat Ödülleri Sahiplerini Buldu</h3>
            <p>Her yıl farklı bir dalda verilen prestijli Cevdet Kudret Edebiyat Ödülü, bu yıl şiir dalında sahibini buldu. Seçici kurul, ödülü genç şairlerin yenilikçi dilini teşvik etmek amacıyla bu yıl iki eser arasında paylaştırdı. Kazanan şairler, ödülü edebiyatın birleştirici gücüne adadıklarını belirttiler.</p>

            <h3>Genç Yazarlar İçin Yeni Fon Desteği</h3>
            <p>Kültür Bakanlığı ve çeşitli sivil toplum kuruluşlarının iş birliğiyle hazırlanan yeni 'İlk Eser' destek fonu açıklandı. İlk roman, öykü veya şiir kitabını çıkaracak olan 30 yaş altı genç yazarlara editöryal ve maddi destek sağlanacak. Başvuruların haziran sonuna kadar devam edeceği bildirildi.</p>
        `
    },
    {
        id: "yarismalar-1",
        title: "Aylık Öykü Yarışması Başlıyor!",
        subtitle: "Mürekkep, genç yazarları teşvik etmek amacıyla aylık öykü yarışmaları serisini başlatıyor.",
        author: "Mürekkep Yarışma Kurulu",
        category: "yarismalar",
        image: "assets/typewriter_birds.webp",
        date: "22 Mayıs 2026",
        readTime: "4 dk okuma",
        claps: 130,
        comments: [],
        content: `
            <p>Mürekkep Dijital Gazetesi olarak, edebiyata yeni soluklar kazandırmak ve genç kalemleri cesaretlendirmek amacıyla her ay düzenleyeceğimiz öykü yarışmalarının ilkini başlatıyoruz!</p>
            <h3>Yarışma Detayları</h3>
            <ul>
                <li><strong>Birinci Ayın Teması:</strong> "Umut"</li>
                <li><strong>Katılım Koşulları:</strong> Öykülerin daha önce hiçbir yerde yayınlanmamış olması ve en fazla 2000 kelimeden oluşması gerekmektedir.</li>
                <li><strong>Son Başvuru Tarihi:</strong> 31 Temmuz 2026</li>
                <li><strong>Ödüller:</strong> Dereceye giren ilk 3 öykü Mürekkep Gazetesi'nin basılı özel sayısında yayınlanacak ve yazarlara edebi kitap seti hediye edilecektir.</li>
            </ul>
            <p>Yazılarınızı yarisma@murekkep.com adresine veya 'Yazı Yaz' stüdyomuzu kullanarak doğrudan sitemize gönderebilirsiniz. Kalemlerinize kuvvet!</p>
        `
    },
    {
        id: "deneme-2",
        title: "Yapay Zeka Çağında Edebiyat",
        subtitle: "Algoritmalar şiir yazabilir mi, yoksa edebiyat insanın son sığınağı olarak kalmaya devam mı edecek?",
        author: "Hakan Yılmaz",
        category: "deneme",
        image: "assets/typewriter_birds.webp",
        date: "23 Mayıs 2026",
        readTime: "5 dk okuma",
        claps: 95,
        comments: [],
        content: `
            <p>Makinelerin düşünmeye, resim yapmaya ve hatta kod yazmaya başladığı bir çağda, insan yaratıcılığının en özel alanlarından biri olan edebiyatın geleceği de büyük bir tartışma konusu haline geldi. Büyük dil modelleri artık saniyeler içinde kafiyeli şiirler yazabiliyor, klasik yazarların üslubunu taklit edebiliyor.</p>
            <p>Peki bu durum, edebi üretimin sonu anlamına mı geliyor? Hayır. Edebiyat, sadece kelimelerin mantıklı bir dizilimi değildir. Edebiyat; acının, sevincin, hayal kırıklığının ve felsefi arayışların estetik bir yansımasıdır. Yapay zeka yazabilir, ancak hissedemez. Edebi eserin gücü, yazarın kendi deneyimini, canı yanarak veya coşkuyla kelimelere aktarmasından gelir.</p>
            <p>Bu yeni çağda dijital platformlar, insan kelamının değerini yitirmesine değil, tam aksine hakiki insan hissiyatını barındıran edebi eserlerin öne çıkmasına vesile olacaktır. Mürekkep, işte bu dijitalleşen dünyada insanın özgün sesini korumak için en önemli sığınaklardan biridir.</p>
        `
    },
    {
        id: "siir-2",
        title: "Sessiz Liman",
        subtitle: "Zamanın akışında kaybolan anlara ve sükunete dair lirik bir şiir.",
        author: "Esra Demir",
        category: "siir",
        image: "assets/poetry_flowers.webp",
        date: "23 Mayıs 2026",
        readTime: "2 dk okuma",
        claps: 85,
        comments: [],
        content: `
            <p class="poem-text">Rüzgar dindi, sular duruldu nihayet,<br>
            Sessiz bir limana sığındı gölgeler.<br>
            Ne bir ses var ufukta, ne bir işaret,<br>
            Zamanın içinde eriyip gitti dünler.</p>
            
            <p class="poem-text">Mürekkep dağılır, kelimeler uçuşur havada,<br>
            Kalan sadece kalbin o ince fısıltısı.<br>
            Bir edebi yolculuk başlar bu tenhada,<br>
            Geriye kalan, ruhun o kadim yansıması.</p>
        `
    },
    {
        id: "oyku-2",
        title: "Kayıp Zamanın İzinde",
        subtitle: "Eski bir köşkün tozlu kütüphanesinde unutulmuş bir mektubun peşinde sürüklenen gizemli bir anı.",
        author: "Murat Can",
        category: "oyku",
        image: "assets/rainy_window.webp",
        date: "23 Mayıs 2026",
        readTime: "8 dk okuma",
        claps: 75,
        comments: [],
        content: `
            <p>Büyükbabamdan kalan o eski köşkün çatı katındaki kütüphane, benim için çocukluğumun en büyük gizem kutusuydu. Tozlu raflar, sararmış sayfalar ve deri ciltli eski romanlar arasında saatler geçirirdim. Bir gün, kalın bir ansiklopedinin sayfaları arasından kayıp düşen sarı bir zarf buldum.</p>
            <p>Zarfın üzerinde hiçbir isim yazmıyordu, sadece 1945 yılına ait eski bir pul yapıştırılmıştı. İçindeki mektubu açtığımda, el yazısıyla yazılmış şu satırlarla karşılaştım: 'Zaman her şeyi unutturur derler ama kelimeler kalıcıdır. Mürekkep kurur, kağıt solar ama hissedilen o an, mektupta asılı kalır...'</p>
            <p>Meketubun kime yazıldığını asla öğrenemedim. Ancak o an anladım ki yazmak, zamana karşı kazanılmış en büyük zaferdir. Yıllar önce yazılmış o mektup, bugün benim zihnimde yeni bir hikaye başlatmıştı. Edebiyat da tam olarak buydu: Yıllar sonra bile bir başkasının ruhuna dokunabilmek.</p>
        `
    }
];

const DEFAULT_COMMENTS = [];

// Initialize Storage
let articles = [];
let comments = [];

// =============================================
// ADMIN LAYOUT, CUSTOM CATEGORIES & SETTINGS
// =============================================

const DEFAULT_LAYOUT = {
    colWidths: { col1: 1, col2: 2, col3: 1 },
    col1: [
        { type: "category", value: "kitap", label: "Kitap İncelemesi", size: "normal", slotWidth: 1, style: "standard" },
        { type: "category", value: "roportaj", label: "Yazar Röportajı", size: "normal", slotWidth: 1, style: "standard" },
        { type: "category", value: "haber", label: "Edebiyat Haberleri", size: "normal", slotWidth: 1, style: "standard" }
    ],
    col2: [
        { type: "system", value: "headline", label: "Manşet", size: "large", slotWidth: 2, style: "headline" },
        { type: "system", value: "editor_note", label: "Editörün Notu", size: "normal", slotWidth: 2, style: "standard" },
        { type: "category", value: "siir", label: "Haftanın Şiiri", size: "normal", slotWidth: 2, style: "poem" },
        { type: "category", value: "yarismalar", label: "Aylık Yarışma", size: "normal", slotWidth: 1, style: "standard" },
        { type: "category", value: "kose-yazilari", label: "Köşe Yazısı", size: "normal", slotWidth: 1, style: "columnist" }
    ],
    col3: [
        { type: "category", value: "deneme", label: "Deneme", size: "normal", slotWidth: 1, style: "standard" },
        { type: "category", value: "oyku", label: "Hikaye Köşesi", size: "normal", slotWidth: 1, style: "standard" },
        { type: "system", value: "recent_comments", label: "Okur Yorumları", size: "normal", slotWidth: 1, style: "standard" }
    ]
};

let layoutConfig = null;
let customCategories = [];
let editorNoteData = {
    quote: "Mürekkep, genç yazarların sesini duymak, edebiyata yeni nefesler katmak için kuruldu.",
    desc: "Amacımız; nitelikli içerikleri desteklemek, edebiyatseverleri bir araya getirmek ve dijital dünyanın sunduğu imkânlarla edebiyatı geleceğe taşımaktır."
};

// Category helper list (built-in + custom)
function getCategoriesList() {
    const builtIn = [
        { id: "kitap", name: "Kitap İncelemesi" },
        { id: "deneme", name: "Deneme" },
        { id: "roportaj", name: "Yazar Röportajı" },
        { id: "siir", name: "Şiir" },
        { id: "oyku", name: "Öykü" },
        { id: "kose-yazilari", name: "Köşe Yazısı" },
        { id: "haber", name: "Edebiyat Haberleri" },
        { id: "yarismalar", name: "Yarışmalar" }
    ];
    return [...builtIn, ...customCategories];
}

// IO Functions for User Notifications
let userNotifications = [];

async function loadNotifications() {
    if (!currentUser) {
        userNotifications = [];
        return;
    }
    const key = `notifications_${currentUser.username.toLowerCase().trim()}`;
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .single();
            if (data && data.value) {
                userNotifications = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem(`murekkep_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
                renderNotifications();
                return;
            }
        } catch(e) {
            console.warn("Failed to load notifications from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem(`murekkep_notifications_${currentUser.id}`);
        userNotifications = saved ? JSON.parse(saved) : [];
    } catch(e) {
        userNotifications = [];
    }
    renderNotifications();
}

async function saveNotifications() {
    if (!currentUser) return;
    const key = `notifications_${currentUser.username.toLowerCase().trim()}`;
    try {
        localStorage.setItem(`murekkep_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
    } catch(e) {}
    
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: key, value: userNotifications });
        } catch (e) {
            console.error("Failed to save notifications to Supabase:", e);
        }
    }
    renderNotifications();
}

async function createNotification(targetAuthorName, type, fromUser, text, targetLinkData = {}) {
    if (!targetAuthorName) return;
    const key = `notifications_${targetAuthorName.toLowerCase().trim()}`;
    
    let targetNotifications = [];
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .single();
            if (data && data.value) {
                targetNotifications = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            }
        } catch(e) {}
    } else {
        try {
            const saved = localStorage.getItem(`murekkep_notifications_${targetAuthorName.toLowerCase().trim()}`);
            if (saved) targetNotifications = JSON.parse(saved);
        } catch(e) {}
    }
    
    const newNotif = {
        id: generateId(),
        type: type,
        fromUser: fromUser,
        text: text,
        date: new Date().toISOString(),
        read: false,
        linkData: targetLinkData
    };
    targetNotifications.unshift(newNotif);
    
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: key, value: targetNotifications });
        } catch(e) {}
    } else {
        try {
            localStorage.setItem(`murekkep_notifications_${targetAuthorName.toLowerCase().trim()}`, JSON.stringify(targetNotifications));
        } catch(e) {}
    }
}

function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
         return 'şimdi';   
    } else if (elapsed < msPerHour) {
         return Math.round(elapsed / msPerMinute) + ' dk önce';   
    } else if (elapsed < msPerDay ) {
         return Math.round(elapsed / msPerHour ) + ' saat önce';   
    } else {
         return Math.round(elapsed / msPerDay) + ' gün önce';   
    }
}

function initNotifications() {
    const notificationsBtn = document.getElementById("notifications-btn");
    const notificationsMenu = document.getElementById("notifications-dropdown-menu");
    const markAllReadBtn = document.getElementById("mark-all-read-btn");

    if (!notificationsBtn || !notificationsMenu) return;

    notificationsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = notificationsMenu.classList.contains("hidden");
        
        // Close profile dropdown if open
        toggleProfileDropdown(true);
        const searchDropdown = document.getElementById("author-search-results");
        if (searchDropdown) searchDropdown.classList.add("hidden");

        if (isHidden) {
            notificationsMenu.classList.remove("hidden");
            notificationsBtn.setAttribute("aria-expanded", "true");
        } else {
            notificationsMenu.classList.add("hidden");
            notificationsBtn.setAttribute("aria-expanded", "false");
        }
    });

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userNotifications = userNotifications.map(n => ({ ...n, read: true }));
            saveNotifications();
        });
    }

    document.addEventListener("click", (e) => {
        if (!notificationsMenu.contains(e.target) && !notificationsBtn.contains(e.target)) {
            notificationsMenu.classList.add("hidden");
            notificationsBtn.setAttribute("aria-expanded", "false");
        }
    });
}

function renderNotifications() {
    const listContainer = document.getElementById("notifications-list");
    const badge = document.getElementById("notifications-badge");

    if (!listContainer) return;

    listContainer.innerHTML = "";

    const unreadCount = userNotifications.filter(n => !n.read).length;
    if (badge) {
        if (unreadCount > 0) {
            badge.innerText = unreadCount;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    if (userNotifications.length === 0) {
        listContainer.innerHTML = `<div class="notifications-empty">Henüz bir bildiriminiz yok.</div>`;
        return;
    }

    userNotifications.forEach(notif => {
        const item = document.createElement("div");
        item.className = `notification-item ${notif.read ? '' : 'unread'}`;

        const avatarHtml = getAuthorAvatarHtml(notif.fromUser, 30);
        item.innerHTML = `
            ${avatarHtml}
            <div class="notification-item-text">
                <div><strong>${notif.fromUser}</strong> ${notif.text}</div>
                <div class="notification-item-time">${timeAgo(notif.date)}</div>
            </div>
            ${notif.read ? '' : '<div class="notification-item-dot"></div>'}
        `;

        item.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Mark as read
            notif.read = true;
            saveNotifications();

            // Close dropdown
            const menu = document.getElementById("notifications-dropdown-menu");
            if (menu) menu.classList.add("hidden");
            const btn = document.getElementById("notifications-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");

            // Navigate
            if (notif.type === 'follow') {
                window.openAuthorProfile(notif.fromUser);
            } else if ((notif.type === 'clap' || notif.type === 'comment') && notif.linkData && notif.linkData.articleId) {
                openArticle(notif.linkData.articleId);
            }
        });

        listContainer.appendChild(item);
    });
}

// IO Functions for Custom Author Profiles
let authorProfiles = {};

async function loadAuthorProfiles() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'author_profiles')
                .single();
            if (data && data.value) {
                authorProfiles = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem("murekkep_author_profiles", JSON.stringify(authorProfiles));
                console.log("Loaded author profiles from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load author profiles from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_author_profiles");
        if (saved) {
            authorProfiles = JSON.parse(saved);
            console.log("Loaded author profiles from localStorage.");
            return;
        }
    } catch (e) {}
    authorProfiles = {};
}

async function saveAuthorProfiles() {
    try {
        localStorage.setItem("murekkep_author_profiles", JSON.stringify(authorProfiles));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'author_profiles', value: authorProfiles });
            console.log("Saved author profiles to Supabase.");
        } catch (e) {
            console.error("Failed to save author profiles to Supabase:", e);
        }
    }
}

// IO Functions for User Roles and Access Control
const DEFAULT_USER_ROLES = [
    { email: "admin@murekkep.com", username: "Mürekkep Yöneticisi", role: "admin" },
    { email: "editor@murekkep.com", username: "Mürekkep Editörü", role: "editor" }
];
let userRoles = [];

async function loadUserRoles() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'user_roles')
                .single();
            if (data && data.value) {
                userRoles = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem("murekkep_user_roles", JSON.stringify(userRoles));
                console.log("Loaded user roles from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load user roles from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_user_roles");
        if (saved) {
            userRoles = JSON.parse(saved);
            console.log("Loaded user roles from localStorage.");
            return;
        }
    } catch (e) {}
    
    // Fallback to default user roles
    userRoles = JSON.parse(JSON.stringify(DEFAULT_USER_ROLES));
    try {
        localStorage.setItem("murekkep_user_roles", JSON.stringify(userRoles));
    } catch(e) {}
}

async function saveUserRoles() {
    try {
        localStorage.setItem("murekkep_user_roles", JSON.stringify(userRoles));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'user_roles', value: userRoles });
            console.log("Saved user roles to Supabase.");
        } catch (e) {
            console.error("Failed to save user roles to Supabase:", e);
        }
    }
}

function getUserRole(email) {
    if (!email) return "user";
    const emailNorm = email.toLowerCase().trim();
    const match = userRoles.find(u => u.email.toLowerCase().trim() === emailNorm);
    return match ? match.role : "user";
}

async function registerUserInList(email, username) {
    if (!email) return;
    const emailNorm = email.toLowerCase().trim();
    const displayName = username || emailNorm.split("@")[0];
    
    let list = [];
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'registered_users')
                .single();
            if (data && data.value) {
                list = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            }
        } catch(e) {}
    } else {
        try {
            list = JSON.parse(localStorage.getItem("murekkep_registered_users") || "[]");
        } catch(e) {}
    }
    
    // Check if already in list
    if (!list.some(u => u.email.toLowerCase().trim() === emailNorm)) {
        list.push({
            email: emailNorm,
            username: displayName,
            date: new Date().toLocaleDateString('tr-TR'),
            role: getUserRole(emailNorm) || 'user'
        });
        
        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient
                    .from('site_settings')
                    .upsert({ key: 'registered_users', value: list });
                console.log("Registered user appended on Supabase.");
            } catch(e) {
                console.error("Error saving registered users list:", e);
            }
        } else {
            localStorage.setItem("murekkep_registered_users", JSON.stringify(list));
        }
    }
}

// User Management UI & Control Handlers
function renderUsersManagementUI() {
    const listContainer = document.getElementById("admin-users-list-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    // Gather all users to show
    let displayUsers = [];

    // Always include pre-defined accounts or those in userRoles
    userRoles.forEach(r => {
        if (!displayUsers.some(u => u.email.toLowerCase().trim() === r.email.toLowerCase().trim())) {
            displayUsers.push({
                email: r.email,
                username: r.username,
                role: r.role
            });
        }
    });

    // In offline mode, also read from murekkep_mock_users
    if (!isSupabaseConnected) {
        try {
            const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            mockUsers.forEach(m => {
                if (!displayUsers.some(u => u.email.toLowerCase().trim() === m.email.toLowerCase().trim())) {
                    displayUsers.push({
                        email: m.email,
                        username: m.username,
                        role: "user"
                    });
                }
            });
        } catch(e) {}
    }

    if (displayUsers.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 15px; font-size: 0.85rem;">Kayıtlı yetkili bulunmuyor.</p>`;
        return;
    }

    displayUsers.forEach(u => {
        const emailLower = u.email.toLowerCase().trim();
        const isPredefinedAdmin = (emailLower === "admin@murekkep.com");
        
        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border-light); border-radius: 8px; background: rgba(255,255,255,0.01);";

        // Role select HTML
        let roleOptionsHtml = `
            <select onchange="window.updateUserRoleInAdmin('${u.email}', this.value)" style="font-size:0.75rem; padding:4px; border-radius:4px; background:var(--bg-primary); color:var(--text-primary); border:1px solid var(--border-light);" ${isPredefinedAdmin ? 'disabled' : ''}>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Yönetici</option>
                <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Editör</option>
                <option value="user" ${u.role === 'user' ? 'selected' : ''}>Yazar/Okur</option>
            </select>
        `;

        row.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${u.username}</span>
                <span style="font-size: 0.72rem; color: var(--text-secondary);">${u.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                ${roleOptionsHtml}
                <button onclick="window.deleteUserInAdmin('${u.email}')" 
                        class="btn-editor-action delete" 
                        style="padding: 4px 10px; font-size: 0.7rem; ${isPredefinedAdmin ? 'display:none;' : ''}">
                    Sil
                </button>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

window.updateUserRoleInAdmin = async function(email, newRole) {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("✕ Yetkiniz bulunmamaktadır.");
        return;
    }
    
    const emailNorm = email.toLowerCase().trim();
    if (emailNorm === "admin@murekkep.com") {
        showToast("✕ Ana yöneticinin yetkisi değiştirilemez.");
        return;
    }

    // Remove old role if setting to 'user' (standard user)
    userRoles = userRoles.filter(r => r.email.toLowerCase().trim() !== emailNorm);

    // If new role is admin or editor, add it
    if (newRole === "admin" || newRole === "editor") {
        let username = emailNorm.split("@")[0];
        try {
            if (!isSupabaseConnected) {
                const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
                const mUser = mockUsers.find(u => u.email.toLowerCase().trim() === emailNorm);
                if (mUser) username = mUser.username;
            }
        } catch(e) {}

        userRoles.push({
            email: emailNorm,
            username: username,
            role: newRole
        });
    }

    await saveUserRoles();
    showToast("Yetki başarıyla güncellendi.");
    renderUsersManagementUI();
};

window.deleteUserInAdmin = async function(email) {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("✕ Yetkiniz bulunmamaktadır.");
        return;
    }

    const emailNorm = email.toLowerCase().trim();
    if (emailNorm === "admin@murekkep.com") {
        showToast("✕ Ana yönetici silinemez.");
        return;
    }

    let targetUsername = "";
    const roleObj = userRoles.find(r => r.email.toLowerCase().trim() === emailNorm);
    if (roleObj) targetUsername = roleObj.username;

    if (!isSupabaseConnected) {
        try {
            const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            const mUser = mockUsers.find(u => u.email.toLowerCase().trim() === emailNorm);
            if (mUser && !targetUsername) targetUsername = mUser.username;
        } catch(e) {}
    }

    const deleteArticles = confirm(`"${emailNorm}" hesabını silmek istediğinizden emin misiniz?\n\nTamam'a basarsanız yetkisi kaldırılacaktır. Eğer bu yazarın yazdığı tüm yazıları da silmek istiyorsanız, bir sonraki adımda onaylayın.`);
    const deleteAllPosts = deleteArticles ? confirm(`Silinen yazara ait tüm makaleler ve köşe yazıları da kalıcı olarak silinsin mi?`) : false;

    // Remove from userRoles
    userRoles = userRoles.filter(r => r.email.toLowerCase().trim() !== emailNorm);
    await saveUserRoles();

    // Remove from mock users if offline
    if (!isSupabaseConnected) {
        try {
            let mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            mockUsers = mockUsers.filter(u => u.email.toLowerCase().trim() !== emailNorm);
            localStorage.setItem("murekkep_mock_users", JSON.stringify(mockUsers));
        } catch(e) {}
        
        if (currentUser && currentUser.email.toLowerCase().trim() === emailNorm) {
            signOutUser();
        }
    }

    // Delete author profile
    if (targetUsername) {
        const key = targetUsername.toLowerCase().trim();
        if (authorProfiles[key]) {
            delete authorProfiles[key];
            await saveAuthorProfiles();
        }
    }

    // Delete articles if requested
    if (deleteAllPosts && targetUsername) {
        articles = articles.filter(art => {
            const match = normalizeTurkishString(art.author) === normalizeTurkishString(targetUsername);
            if (match) {
                if (isSupabaseConnected) {
                    supabaseClient.from('articles').delete().eq('id', art.id).then(({ error }) => {
                        if (error) console.error("Error deleting user article from Supabase:", error);
                    });
                }
            }
            return !match;
        });

        if (isSupabaseConnected) {
            clearSupabaseCache();
        } else {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        }
        
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }

    showToast("Kullanıcı başarıyla silindi.");
    renderUsersManagementUI();
};

window.createUserInAdmin = async function() {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("✕ Yetkiniz bulunmamaktadır.");
        return;
    }

    const usernameInput = document.getElementById("admin-new-user-username");
    const emailInput = document.getElementById("admin-new-user-email");
    const passwordInput = document.getElementById("admin-new-user-password");
    const roleSelect = document.getElementById("admin-new-user-role");

    if (!usernameInput || !emailInput || !passwordInput || !roleSelect) return;

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;

    if (!username || !email || !password || !role) {
        showToast("✕ Lütfen tüm alanları doldurun.");
        return;
    }

    const emailNorm = email.toLowerCase().trim();

    if (userRoles.some(r => r.email.toLowerCase().trim() === emailNorm)) {
        showToast("✕ Bu e-posta adresi zaten yetkilendirilmiş.");
        return;
    }

    // Add to userRoles
    userRoles.push({
        email: emailNorm,
        username: username,
        role: role
    });
    await saveUserRoles();

    // If offline, create mock account in murekkep_mock_users
    if (!isSupabaseConnected) {
        try {
            const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            if (!mockUsers.some(u => u.email.toLowerCase().trim() === emailNorm)) {
                mockUsers.push({
                    id: "u_" + Date.now(),
                    email: emailNorm,
                    password: password,
                    username: username
                });
                localStorage.setItem("murekkep_mock_users", JSON.stringify(mockUsers));
            }
        } catch(e) {}
    } else {
        showToast("ℹ️ Çevrimiçi mod: Kullanıcı bu e-posta ile kayıt olduğunda yetkileri aktif olacaktır.", "ℹ️");
    }

    // Create empty profile
    const profileKey = username.toLowerCase().trim();
    if (!authorProfiles[profileKey]) {
        authorProfiles[profileKey] = {
            bioVal: "Mürekkep Yazarı",
            avatarType: "initial",
            avatarVal: ""
        };
        await saveAuthorProfiles();
    }

    usernameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";

    showToast("✅ Yetkili hesap başarıyla oluşturuldu.");
    renderUsersManagementUI();
};

// IO Functions for Author Followers (Followings list)
async function loadAuthorFollowers() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'author_followers')
                .single();
            if (data && data.value) {
                const followersData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
                console.log("Loaded author followers from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load author followers from Supabase:", e);
        }
    }
}

async function saveAuthorFollowers(followersData) {
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'author_followers', value: followersData });
            console.log("Saved author followers to Supabase.");
        } catch (e) {
            console.error("Failed to save author followers to Supabase:", e);
        }
    }
}

// Helper for Username Migration across all components
async function performUsernameMigration(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;

    if (currentUser) {
        currentUser.username = newName;
    }

    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient.auth.updateUser({ data: { username: newName } });
        } catch (e) {
            console.warn("Could not update username on Supabase:", e);
        }
    }

    try {
        const mockSession = localStorage.getItem("murekkep_mock_session");
        if (mockSession) {
            const parsed = JSON.parse(mockSession);
            parsed.username = newName;
            localStorage.setItem("murekkep_mock_session", JSON.stringify(parsed));
        }
    } catch (e) {}

    try {
        const oldKey = oldName.toLowerCase().trim();
        const newKey = newName.toLowerCase().trim();
        if (authorProfiles[oldKey]) {
            authorProfiles[newKey] = authorProfiles[oldKey];
            delete authorProfiles[oldKey];
            saveAuthorProfiles();
        }
    } catch (e) {}

    try {
        const followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
        const oldKey = oldName.trim();
        const newKey = newName.trim();
        if (followersData[oldKey]) {
            followersData[newKey] = followersData[oldKey];
            delete followersData[oldKey];
        }
        
        Object.keys(followersData).forEach(k => {
            const idx = followersData[k].indexOf(oldKey);
            if (idx !== -1) {
                followersData[k][idx] = newKey;
            }
        });
        localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
        await saveAuthorFollowers(followersData);
    } catch (e) {}

    try {
        const localArticles = JSON.parse(localStorage.getItem("murekkep_articles_v2") || "[]");
        localArticles.forEach(art => {
            if (art.author && art.author.trim().toLowerCase() === oldName.trim().toLowerCase()) {
                art.author = newName;
            }
        });
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(localArticles));
        
        articles.forEach(art => {
            if (art.author && art.author.trim().toLowerCase() === oldName.trim().toLowerCase()) {
                art.author = newName;
            }
        });
    } catch (e) {}
}


// IO Functions for Custom Categories
async function loadCategories() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'custom_categories')
                .single();
            if (data && data.value) {
                customCategories = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                console.log("Loaded custom categories from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load custom categories from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_custom_categories");
        if (saved) {
            customCategories = JSON.parse(saved);
            console.log("Loaded custom categories from localStorage.");
            return;
        }
    } catch (e) {}
    customCategories = [];
}

async function saveCategories() {
    try {
        localStorage.setItem("murekkep_custom_categories", JSON.stringify(customCategories));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'custom_categories', value: customCategories });
        } catch (e) {}
    }
}

// IO Functions for Layout Config
async function loadLayoutConfig() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'layout_config_v4')
                .single();
            if (data && data.value) {
                layoutConfig = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                console.log("Loaded layout config from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load layout config from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_layout_config_v4");
        if (saved) {
            layoutConfig = JSON.parse(saved);
            console.log("Loaded layout config from localStorage.");
            return;
        }
    } catch (e) {
        console.warn("Failed to load layout config from localStorage:", e);
    }
    layoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    console.log("Using default layout config.");
}

async function saveLayoutConfig() {
    if (!layoutConfig) return;
    try {
        localStorage.setItem("murekkep_layout_config_v4", JSON.stringify(layoutConfig));
    } catch (e) {
        console.warn("Failed to save layout config to localStorage:", e);
    }
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('site_settings')
                .upsert({ key: 'layout_config_v4', value: layoutConfig });
            if (error) console.error("Error saving layout config to Supabase:", error);
            else console.log("Saved layout config to Supabase.");
        } catch (e) {
            console.error("Failed to save layout config to Supabase:", e);
        }
    }
}

// IO Functions for Editor's Note
async function loadEditorNoteData() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'editor_note')
                .single();
            if (data && data.value) {
                editorNoteData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                console.log("Loaded editor note from Supabase.");
                return;
            }
        } catch (e) {}
    }
    try {
        const saved = localStorage.getItem("murekkep_editor_note");
        if (saved) {
            editorNoteData = JSON.parse(saved);
            console.log("Loaded editor note from localStorage.");
            return;
        }
    } catch (e) {}
}

async function saveEditorNoteData() {
    const quoteInput = document.getElementById("settings-editor-note-quote");
    const descInput = document.getElementById("settings-editor-note-desc");
    if (quoteInput && descInput) {
        editorNoteData.quote = quoteInput.value;
        editorNoteData.desc = descInput.value;
    }
    try {
        localStorage.setItem("murekkep_editor_note", JSON.stringify(editorNoteData));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'editor_note', value: editorNoteData });
        } catch (e) {}
    }
}

// UI Render Helpers
function renderCategoriesNav() {
    const navUl = document.querySelector(".header-nav ul");
    if (!navUl) return;
    
    let html = `<li><button class="nav-filter active" data-category="all">HEPSİ</button></li>`;
    const cats = getCategoriesList();
    cats.forEach(c => {
        html += `<li><button class="nav-filter" data-category="${c.id}">${c.name.toUpperCase()}</button></li>`;
    });
    html += `<li><button class="nav-filter ${currentUser ? '' : 'hidden'}" data-category="bookmarks" id="bookmarks-tab" style="border-color: var(--accent-color); color: var(--accent-color); font-weight: 700;">KAYDEDİLENLER</button></li>`;
    
    navUl.innerHTML = html;
    
    document.querySelectorAll(".nav-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-category");
            filterCategory(cat);
        });
    });
}

function renderCategoriesDropdown() {
    const select = document.getElementById("post-category");
    if (!select) return;
    
    let html = "";
    const cats = getCategoriesList();
    const isUserAdmin = currentUser && currentUser.isEditor;
    
    cats.forEach(c => {
        // Only admins can write in "yarismalar" (Edebiyat Yarışması) and "haber" (Edebiyat Haberleri)
        if ((c.id === "yarismalar" || c.id === "haber") && !isUserAdmin) {
            return;
        }
        html += `<option value="${c.id}">${c.name}</option>`;
    });
    select.innerHTML = html;
}

function renderCustomCategoriesList() {
    const listEl = document.getElementById("custom-categories-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    
    customCategories.forEach(c => {
        const row = document.createElement("div");
        row.className = "category-item-row";
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border:1px solid var(--border-light); border-radius:8px; margin-bottom:6px; background:rgba(255,255,255,0.01);";
        row.innerHTML = `
            <span style="font-family:var(--font-ui); font-size:0.8rem; color:var(--text-primary); font-weight:700;">${c.name}</span>
            <button type="button" onclick="window.removeCustomCategory('${c.id}')" style="background:none; border:none; color:var(--accent-color); cursor:pointer; font-weight:700; font-size:0.8rem;">Kaldır</button>
        `;
        listEl.appendChild(row);
    });
}

function populateEditorSettingsUI() {
    const quoteInput = document.getElementById("settings-editor-note-quote");
    const descInput = document.getElementById("settings-editor-note-desc");
    if (quoteInput && descInput && editorNoteData) {
        quoteInput.value = editorNoteData.quote || "";
        descInput.value = editorNoteData.desc || "";
    }
}

window.renderLayoutConfigurator = function() {
    if (!layoutConfig) return;
    
    const cats = getCategoriesList();
    const valueOptionsList = [
        { value: "headline", label: "Sistem: Manşet", type: "system" },
        { value: "recent_comments", label: "Sistem: Okur Yorumları", type: "system" },
        { value: "popular_posts", label: "Sistem: Çok Okunanlar", type: "system" },
        { value: "popular_authors", label: "Sistem: Haftanın Yazarları", type: "system" },
        { value: "editor_note", label: "Sistem: Editörün Notu", type: "system" }
    ];
    
    cats.forEach(c => {
        valueOptionsList.push({ value: c.id, label: `Kategori: ${c.name}`, type: "category" });
    });
    
    const styleOptions = [
        { value: "standard", label: "Standart Kart" },
        { value: "headline", label: "Manşet Tasarımı" },
        { value: "editorial", label: "Başyazı Tasarımı" },
        { value: "columnist", label: "Yazar Tasarımı" },
        { value: "poem", label: "Şiir Tasarımı" },
        { value: "list", label: "Liste Tasarımı" }
    ];

    ['col1', 'col2', 'col3'].forEach(colKey => {
        const listEl = document.getElementById(`${colKey}-slots-list`);
        if (!listEl) return;
        listEl.innerHTML = "";
        
        const slots = layoutConfig[colKey] || [];
        slots.forEach((slot, index) => {
            let valueOptions = "";
            valueOptionsList.forEach(opt => {
                const isSelected = slot.value === opt.value;
                valueOptions += `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${opt.label}</option>`;
            });
            
            let styleOptionsHtml = "";
            styleOptions.forEach(opt => {
                const isSelected = slot.style === opt.value;
                styleOptionsHtml += `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${opt.label}</option>`;
            });
            
            const styleSelect = `
                <select class="form-control slot-style-select" style="font-size: 0.75rem; padding: 4px 8px; height: 30px; flex: 1; min-width: 100px;" onchange="window.updateSlotStyle('${colKey}', ${index}, this.value)">
                    ${styleOptionsHtml}
                </select>
            `;
            
            const slotSize = slot.size || 'normal';
            const sizeKeys = ['compact', 'normal', 'large'];
            const sizeLabels = { compact: 'S – Kompakt', normal: 'M – Normal', large: 'L – Büyük' };
            let sizeBtnsHtml = '';
            sizeKeys.forEach(sk => {
                const isActive = slotSize === sk;
                sizeBtnsHtml += `<button type="button" onclick="window.updateSlotSize('${colKey}', ${index}, '${sk}')" title="${sizeLabels[sk]}" style="background:${isActive ? 'var(--accent-color)' : 'var(--bg-primary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">${sk === 'compact' ? 'S' : sk === 'normal' ? 'M' : 'L'}</button>`;
            });

            const slotW = slot.slotWidth || 1;
            let widthBtnsHtml = '';
            for (let w = 1; w <= 3; w++) {
                const isActive = slotW === w;
                widthBtnsHtml += `<button type="button" onclick="window.updateSlotWidth('${colKey}', ${index}, ${w})" title="${w}x Genişlik" style="background:${isActive ? '#2e7d32' : 'var(--bg-primary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#2e7d32' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">${w}x</button>`;
            }

            const slotH = slot.slotHeight || 1;
            let heightBtnsHtml = '';
            for (let h = 1; h <= 3; h++) {
                const isActive = slotH === h;
                heightBtnsHtml += `<button type="button" onclick="window.updateSlotHeight('${colKey}', ${index}, ${h})" title="${h}x Yükseklik" style="background:${isActive ? '#1565c0' : 'var(--bg-primary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#1565c0' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">${h}↕</button>`;
            }

            const row = document.createElement("div");
            row.className = "layout-slot-row";
            row.style.cssText = "display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 10px; border-radius: 8px; margin-bottom: 8px; font-family: var(--font-ui);";
            row.innerHTML = `
                <!-- Dropdowns & Delete Row -->
                <div style="display: flex; gap: 6px; align-items: center; width: 100%; flex-wrap: wrap;">
                    <select class="form-control slot-value-select" style="font-size: 0.75rem; padding: 4px 8px; height: 30px; flex: 1.2; min-width: 120px;" onchange="window.updateSlotTypeVal('${colKey}', ${index}, this.value)">
                        ${valueOptions}
                    </select>
                    ${styleSelect}
                    <button type="button" onclick="window.removeSlotFromColumn('${colKey}', ${index})" style="background: none; border: none; color: var(--accent-color); cursor: pointer; padding: 4px; margin-left: auto;" title="Slotu Kaldır">
                        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
                
                <!-- Editable Slot Label -->
                <div style="display: flex; gap: 6px; align-items: center; width: 100%; margin-top: 2px;">
                    <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; width: 60px;">KÖŞE ADI:</span>
                    <input type="text" value="${slot.label || ''}" placeholder="Köşe başlığını yazın..." class="form-control" style="font-size: 0.72rem; padding: 4px 8px; height: 26px; flex: 1; border-radius: 4px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-ui);" oninput="window.updateSlotLabel('${colKey}', ${index}, this.value)">
                </div>
                
                <!-- Sizing Controls Row -->
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 0.65rem; width: 100%; padding-top: 6px; border-top: 1px dashed var(--border-light);">
                    <!-- Size Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">PUNTO:</span>
                        <div style="display: flex; gap: 2px;">
                            ${sizeBtnsHtml}
                        </div>
                    </div>
                    
                    <!-- Width Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">EN:</span>
                        <div style="display: flex; gap: 2px;">
                            ${widthBtnsHtml}
                        </div>
                    </div>
                    
                    <!-- Height Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">BOY:</span>
                        <div style="display: flex; gap: 2px;">
                            ${heightBtnsHtml}
                        </div>
                    </div>
                </div>
            `;
            listEl.appendChild(row);
        });
    });
};

function wrapSlotInEditorControls(slot, index, colKey, cardHTML, colWeight) {
    if (!cardHTML.trim()) return "";
    
    const slotLabel = slot.type === 'system' ? 'Sistem' : 'Köşe';
    const configDetail = slot.type === 'system' ? slot.label : `${slot.label}`;
    const currentSize = slot.size || 'normal';
    const currentSlotWidth = slot.slotWidth || 1;
    const currentSlotHeight = slot.slotHeight || 1;

    const colLabels = { col1: '◀ Sol', col2: '■ Orta', col3: 'Sağ ▶' };
    let moveButtons = '';
    ['col1', 'col2', 'col3'].forEach(col => {
        if (col !== colKey) {
            moveButtons += `<button type="button" onclick="event.stopPropagation(); window.quickMoveSlot('${colKey}', ${index}, '${col}')" title="${colLabels[col]} Sütuna Taşı" style="background: var(--bg-secondary); border: 1px solid var(--border-light); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${colLabels[col].split(' ')[0]}</button>`;
        }
    });

    const sizeKeys = ['compact', 'normal', 'large'];
    const sizeLabels = { compact: 'S – Kompakt', normal: 'M – Normal', large: 'L – Büyük' };
    let sizeButtons = '';
    sizeKeys.forEach(sk => {
        const isActive = currentSize === sk;
        sizeButtons += `<button type="button" onclick="event.stopPropagation(); window.quickResizeSlot('${colKey}', ${index}, '${sk}')" title="${sizeLabels[sk]}" style="background:${isActive ? 'var(--accent-color)' : 'var(--bg-secondary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-light)'}; font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${sk === 'compact' ? 'S' : sk === 'normal' ? 'M' : 'L'}</button>`;
    });

    let widthButtons = '';
    for (let w = 1; w <= 3; w++) {
        const isActive = currentSlotWidth === w;
        widthButtons += `<button type="button" onclick="event.stopPropagation(); window.quickSetSlotWidth('${colKey}', ${index}, ${w})" title="${w}x Genişlik" style="background:${isActive ? '#2e7d32' : 'var(--bg-secondary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#2e7d32' : 'var(--border-light)'}; font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${w}x</button>`;
    }

    let heightButtons = '';
    for (let h = 1; h <= 3; h++) {
        const isActive = currentSlotHeight === h;
        heightButtons += `<button type="button" onclick="event.stopPropagation(); window.quickSetSlotHeight('${colKey}', ${index}, ${h})" title="${h}x Yükseklik" style="background:${isActive ? '#1565c0' : 'var(--bg-secondary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#1565c0' : 'var(--border-light)'}; font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${h}↕</button>`;
    }

    return `
        <div class="editor-slot-wrapper slot-size-${currentSize} slot-height-${currentSlotHeight}" style="grid-column: span ${currentSlotWidth}; grid-row: span ${currentSlotHeight}; min-width: 0; position: relative; border: 2px solid var(--accent-color); margin-bottom: 16px; border-radius: 8px; background: rgba(201, 64, 64, 0.01); display: flex; flex-direction: column; overflow: hidden;">
            <!-- Editor Toolbar -->
            <div class="slot-editor-toolbar" style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-light); padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; font-family: var(--font-ui); z-index: 10;">
                <!-- Toolbar Row 1: Label and Actions -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="background: var(--accent-color); color: #fff; font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                        ${slotLabel}: ${configDetail}
                    </span>
                    <button type="button" onclick="event.stopPropagation(); window.quickRemoveSlot('${colKey}', ${index})" title="Slotu Kaldır" style="background: #c94040; border: none; color: #ffffff; font-size: 0.65rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: 700; transition: background 0.2s;">✕ Kaldır</button>
                </div>
                
                <!-- Toolbar Row 2: Adjustments -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 0.65rem; width: 100%;">
                    <!-- Move Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">KONUM:</span>
                        <div style="display: flex; gap: 2px;">
                            ${moveButtons}
                        </div>
                    </div>
                    
                    <!-- Size Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">PUNTO:</span>
                        <div style="display: flex; gap: 2px;">
                            ${sizeButtons}
                        </div>
                    </div>
                    
                    <!-- Width Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">EN:</span>
                        <div style="display: flex; gap: 2px;">
                            ${widthButtons}
                        </div>
                    </div>
                    
                    <!-- Height Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">BOY:</span>
                        <div style="display: flex; gap: 2px;">
                            ${heightButtons}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Card Content -->
            <div style="padding: 12px; flex: 1; display: flex; flex-direction: column;">
                ${cardHTML}
            </div>
        </div>
    `;
}

function renderSlotHelper(slot, index, sorted, headlines, recentComments) {
    if (!slot) return "";

    if (slot.type === 'system') {
        if (slot.value === 'headline') {
            const art = headlines[currentPage - 1];
            if (!art) return "";
            return renderSlotCard(art, index, 'headline', 'MANŞET', '');
        }
        
        if (slot.value === 'recent_comments') {
            let commentsHTML = "";
            const activeComments = recentComments.filter(c => c && c.text);
            activeComments.slice(0, 3).forEach((c, idx) => {
                const art = articles.find(a => a.id === c.articleId);
                const articleLinkHtml = art 
                    ? `<span onclick="window.openArticle('${art.id}')" style="font-weight: 500; cursor: pointer; text-decoration: underline; text-underline-offset: 2px;" title="Yazıyı Oku">✍️ ${truncateText(art.title, 20)}</span>`
                    : "";
                const borderStyle = idx === activeComments.slice(0, 3).length - 1 ? "border-bottom: none; padding-bottom: 0; margin-bottom: 0;" : "border-bottom: 1px dotted var(--border-light); padding-bottom: 10px; margin-bottom: 10px;";
                
                commentsHTML += `
                    <div class="reader-quote-item" style="${borderStyle}">
                        <p style="font-family: var(--font-body); font-size: 0.78rem; line-height: 1.4; color: var(--text-primary); font-style: italic; margin-bottom: 4px;">
                            “ ${c.text} ”
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-family: var(--font-ui); font-size: 0.68rem; color: var(--text-secondary); margin-top: 5px;">
                            ${articleLinkHtml}
                            <span class="reader-quote-author" style="font-weight: 700;">— ${c.author}</span>
                        </div>
                    </div>
                `;
            });
            if (!commentsHTML) {
                commentsHTML = `
                    <div style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; font-style: italic; padding: 15px 0;">
                        Henüz okur yorumu bulunmuyor. İlk yorumu siz yazın!
                    </div>
                `;
            }
            return `
                <div class="article-card" style="border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px; cursor: default;" onclick="event.stopPropagation();">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">OKUR YORUMLARI</span>
                    <div class="reader-quotes" style="margin-top: 10px; margin-bottom: 10px;">
                        ${commentsHTML}
                    </div>
                </div>
            `;
        }
        
        if (slot.value === 'editor_note') {
            return `
                <div class="editor-note-box" style="margin-bottom: 20px;">
                    <div class="editor-note-tag">
                        <span>EDİTÖRÜN</span>
                        <span>NOTU</span>
                        <svg viewBox="0 0 24 24"><path d="M14 18.44l-4-4 2.83-2.83 4 4L14 18.44zm-7.66-2.6L12 10.12l-1.41-1.41L4.93 14.43l1.41 1.41zM20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41zM3 21h3.75L17.81 9.94l-3.75-3.75L3 17.25V21z"/></svg>
                    </div>
                    <div class="editor-note-content">
                        <p class="editor-note-quote">“${editorNoteData.quote}”</p>
                        <p class="editor-note-desc">${editorNoteData.desc}</p>
                    </div>
                </div>
            `;
        }
        
        if (slot.value === 'popular_posts') {
            const topArticles = sorted.slice(0, 5);
            let popularHTML = "";
            topArticles.forEach(art => {
                const categoryLabel = art.category ? art.category.replace("-", " ").toUpperCase() : "EDEBİYAT";
                const author = art.author && art.author !== "undefined" ? art.author : "Mürekkep Yazarı";
                popularHTML += `
                    <li class="popular-item" data-id="${art.id}">
                        <div class="popular-item-meta">
                            <span class="popular-item-category">${categoryLabel}</span>
                            <span class="popular-item-claps">
                                <svg viewBox="0 0 24 24"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-1.78 12.77c-.31.31-.69.43-1.07.43-.38 0-.76-.12-1.07-.43-.59-.59-.59-1.54 0-2.12l4.9-4.9c.59-.59 1.54-.59 2.12 0 .59.59.59 1.54 0 2.12l-4.88 4.9zm4.78-4.78c.31-.31.69-.43 1.07-.43.38 0 .76.12 1.07.43.59.59.59 1.54 0 2.12l-4.9 4.9c-.3.3-.68.44-1.06.44-.38 0-.76-.14-1.06-.44-.59-.59-.59-1.54 0-2.12l4.95-4.91z"/></svg>
                                ${art.claps}
                            </span>
                        </div>
                        <h4 class="popular-item-title">${art.title}</h4>
                        <span class="popular-item-author">${author}</span>
                    </li>
                `;
            });

            return `
                <div class="article-card popular-articles-box" style="margin-bottom: 20px;">
                    <span class="card-category">POPÜLER YAZILAR</span>
                    <ul class="popular-list">
                        ${popularHTML}
                    </ul>
                </div>
            `;
        }
        
        if (slot.value === 'popular_authors') {
            const authorMap = {};
            articles.forEach(art => {
                if (!art.author) return;
                const authorNorm = art.author.trim();
                if (!authorMap[authorNorm]) {
                    authorMap[authorNorm] = {
                        name: authorNorm,
                        claps: 0,
                        avatar: authorNorm.substring(0, 1).toUpperCase()
                    };
                }
                authorMap[authorNorm].claps += (parseInt(art.claps) || 0);
            });
            
            const sortedAuthors = Object.values(authorMap).sort((a, b) => b.claps - a.claps).slice(0, 5);
            
            let authorsHTML = "";
            sortedAuthors.forEach((auth, idx) => {
                const badgeHtml = getAuthorRankBadgeHtml(auth.name);
                authorsHTML += `
                    <li class="popular-item" style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--border-light); cursor: default; margin-bottom: 4px;" onclick="event.stopPropagation();">
                        ${getAuthorAvatarHtml(auth.name, 32)}
                        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
                            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span onclick="window.openAuthorProfile('${auth.name.replace(/'/g, "\\'")}')" style="font-family: var(--font-ui); font-size: 0.78rem; font-weight: 800; color: var(--text-primary); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-color)'" onmouseout="this.style.color='var(--text-primary)'">${auth.name}</span>
                                ${badgeHtml}
                            </div>
                            <span style="font-size: 0.65rem; color: var(--text-secondary);">Edebi Etkileşim: 👏 ${auth.claps} | 👥 ${getAuthorFollowerCount(auth.name)}</span>
                        </div>
                        <div style="font-family: var(--font-header); font-size: 0.95rem; font-weight: 900; color: var(--text-secondary); opacity: 0.5;">#${idx + 1}</div>
                    </li>
                `;
            });

            return `
                <div class="article-card popular-articles-box" style="margin-bottom: 20px;">
                    <span class="card-category">HAFTANIN KALEMLERİ</span>
                    <ul class="popular-list" style="list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 4px;">
                        ${authorsHTML || '<li style="font-size:0.75rem; color:var(--text-secondary); text-align:center; padding:10px 0;">Henüz yazar bulunmuyor.</li>'}
                    </ul>
                </div>
            `;
        }
    } else if (slot.type === 'category') {
        // Sequential slot fill: pull next article from the current page's pool
        const art = _pageArticles[_slotArticleIdx++];
        if (!art) {
            if (isEditorModeActive) {
                return `
                    <div class="empty-slot-placeholder" style="border: 2px dashed var(--border-color); padding: 20px; text-align: center; background: rgba(0,0,0,0.02); border-radius: 8px; margin-bottom: 10px;">
                        <span style="font-family: var(--font-ui); font-size: 0.75rem; font-weight: bold; color: var(--text-secondary);">[BOŞ SLOT: ${slot.label}]</span>
                        <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 4px 0 0 0;">Bu sayfada gösterilecek yazı bulunamadı.</p>
                    </div>
                `;
            }
            // Visitor: neat placeholder
            const isUserLoggedIn = !!currentUser;
            const helperText = isUserLoggedIn
                ? "Yazı eklemek için yukarıdaki Yazı Yaz butonunu kullanabilirsiniz."
                : "Yazı eklemek için giriş yapıp yazabilirsiniz.";
            const actionBtn = isUserLoggedIn
                ? `<button onclick="window.openEditorWithCategory('${slot.value}')" style="margin-top: 10px; background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color); font-family: var(--font-ui); font-size: 0.65rem; font-weight: 700; padding: 5px 12px; border-radius: 15px; cursor: pointer; text-transform: uppercase; transition: all 0.2s;" onmouseover="this.style.background='var(--accent-color)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--accent-color)';">Yazı Ekle</button>`
                : `<button onclick="document.getElementById('login-toggle').click()" style="margin-top: 10px; background: transparent; border: 1px solid var(--text-primary); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.65rem; font-weight: 700; padding: 5px 12px; border-radius: 15px; cursor: pointer; text-transform: uppercase; transition: all 0.2s;" onmouseover="this.style.background='var(--text-primary)'; this.style.color='var(--bg-primary)';" onmouseout="this.style.background='transparent'; this.style.color='var(--text-primary)';">Giriş Yap</button>`;
            return `
                <div class="article-card empty-slot-card" style="border: 1px dashed var(--border-light); background: var(--bg-secondary); display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 170px; padding: 20px; text-align: center; margin-bottom: 15px; border-radius: 8px; box-shadow: none;">
                    <span class="card-category" style="opacity: 0.4; font-size: 0.65rem; letter-spacing: 0.5px; font-weight: 700;">YAZI EKLE</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); opacity: 0.5; margin: 8px 0 4px 0;">YAZI BEKLENİYOR</h3>
                    <p style="font-size: 0.68rem; color: var(--text-secondary); opacity: 0.5; margin: 0; line-height: 1.3;">${helperText}</p>
                    ${actionBtn}
                </div>
            `;
        }

        // Slot visual style: determined by the ARTICLE's own category (not slot's)
        let styleType = art.category || slot.value;
        if (slot.style === 'headline') styleType = 'headline';
        else if (slot.style === 'editorial') styleType = 'editorial';
        else if (slot.style === 'columnist') styleType = 'kose';
        else if (slot.style === 'poem') styleType = 'siir';
        else if (slot.style === 'list') styleType = 'popular_list';

        return renderSlotCard(art, index, styleType, slot.label.toUpperCase(), '');
    }
    
    return "";
}

// Editor Action Handlers on Window
window.updateSlotTypeVal = function(colKey, index, value) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    const slot = layoutConfig[colKey][index];
    slot.value = value;
    const systemVals = ["headline", "recent_comments", "popular_posts", "editor_note"];
    slot.type = systemVals.includes(value) ? "system" : "category";
    
    const labels = {
        headline: "Manşet",
        recent_comments: "Okur Yorumları",
        popular_posts: "Çok Okunanlar",
        editor_note: "Editörün Notu"
    };
    if (slot.type === "system") {
        slot.label = labels[value];
    } else {
        const cat = getCategoriesList().find(c => c.id === value);
        slot.label = cat ? cat.name : value;
    }
    renderLayoutConfigurator();
};

window.updateSlotLabel = function(colKey, index, value) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].label = value;
};

window.updateSlotStyle = function(colKey, index, style) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].style = style;
    renderLayoutConfigurator();
};

window.updateSlotSize = function(colKey, index, size) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].size = size;
    renderLayoutConfigurator();
};

window.updateSlotWidth = function(colKey, index, width) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotWidth = width;
    renderLayoutConfigurator();
};

window.updateSlotHeight = function(colKey, index, height) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotHeight = height;
    renderLayoutConfigurator();
};

window.removeSlotFromColumn = function(colKey, index) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].splice(index, 1);
    renderLayoutConfigurator();
};

window.addSlotToColumn = function(colKey) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].push({
        type: "category",
        value: "kitap",
        label: "Kitap İncelemesi",
        size: "normal",
        slotWidth: 1,
        slotHeight: 1,
        style: "standard"
    });
    renderLayoutConfigurator();
};

window.saveLayoutFromUI = async function() {
    await saveEditorNoteData();
    await saveLayoutConfig();
    showToast("✅ Mizanpaj ve Site Ayarları başarıyla kaydedildi!");
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.add("hidden");
    renderNewspaperGrid();
};

window.openEditorWithCategory = function(category) {
    if (!currentUser) {
        openAuthModal();
        showToast("Yazı yayınlamak için lütfen giriş yapın.");
        return;
    }
    const writeBtn = document.getElementById("write-toggle");
    if (writeBtn) {
        writeBtn.click();
    }
    const categorySelect = document.getElementById("post-category");
    if (categorySelect && category) {
        categorySelect.value = category;
    }
};

window.quickAddSlot = function(colKey) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].push({
        type: "category",
        value: "kitap",
        label: "Kitap İncelemesi",
        size: "normal",
        slotWidth: 1,
        slotHeight: 1,
        style: "standard"
    });
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`➕ ${colNames[colKey]} sütuna yeni bir slot eklendi!`);
};

window.quickRemoveSlot = function(colKey, index) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].splice(index, 1);
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    showToast(`✕ Slot kaldırıldı.`);
};

window.quickSetColWidth = function(colKey, width) {
    if (!layoutConfig) return;
    if (!layoutConfig.colWidths) layoutConfig.colWidths = { col1: 1, col2: 2, col3: 1 };
    layoutConfig.colWidths[colKey] = width;
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const colNames = { col1: 'Sol Sütun', col2: 'Orta Sütun', col3: 'Sağ Sütun' };
    showToast(`📐 ${colNames[colKey]} genişliği ${width}x olarak ayarlandı!`);
};

window.quickSetSlotWidth = function(colKey, index, width) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotWidth = width;
    saveLayoutConfig();
    renderNewspaperGrid();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`↔️ ${colNames[colKey]} sütunu ${index + 1}. slot ${width}x genişliğe ayarlandı!`);
};

window.quickSetSlotHeight = function(colKey, index, height) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotHeight = height;
    saveLayoutConfig();
    renderNewspaperGrid();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`↕️ ${colNames[colKey]} sütunu ${index + 1}. slot ${height}x yüksekliğe ayarlandı!`);
};

window.quickResizeSlot = function(colKey, index, size) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].size = size;
    saveLayoutConfig();
    renderNewspaperGrid();
};

window.quickMoveSlot = function(colKey, index, targetCol) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[targetCol]) return;
    const [slot] = layoutConfig[colKey].splice(index, 1);
    const targetCw = layoutConfig.colWidths[targetCol] || 1;
    if (slot.slotWidth > targetCw) {
        slot.slotWidth = 1;
    }
    layoutConfig[targetCol].push(slot);
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`📦 Slot, ${colNames[colKey]} sütunundan ${colNames[targetCol]} sütununa taşındı!`);
};

window.addCustomCategory = async function() {
    const input = document.getElementById("new-category-input");
    if (!input || !input.value.trim()) return;
    
    const catName = input.value.trim();
    const catId = "c_" + catName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    
    if (getCategoriesList().some(c => c.id === catId)) {
        showToast("⚠️ Bu kategori zaten mevcut!");
        return;
    }
    
    customCategories.push({ id: catId, name: catName });
    await saveCategories();
    input.value = "";
    
    showToast(`✅ '${catName}' kategorisi başarıyla eklendi!`);
    renderCategoriesNav();
    renderCategoriesDropdown();
    renderCustomCategoriesList();
    renderLayoutConfigurator();
};

window.removeCustomCategory = async function(catId) {
    customCategories = customCategories.filter(c => c.id !== catId);
    await saveCategories();
    showToast("✅ Kategori kaldırıldı.");
    renderCategoriesNav();
    renderCategoriesDropdown();
    renderCustomCategoriesList();
    renderLayoutConfigurator();
};

// =============================================
// CONTENT MODERATION & SECURITY SYSTEM
// =============================================

const BANNED_WORDS = [
    "amk", "amına", "göt", "piç", "siktir", "sik", "orospu", "yavşak", "pezevenk", "kahpe", "bok", "çüş", "kaltak", "gerzek", "salak", "aptal", "şerefsiz", "it", "kancık", "götlek", "amcık", "meme", "taşşak", "yarak", "yarrak", "sokayım", "sokam", "sikiş", "sokarım", "pic"
];

function containsProfanity(text) {
    if (!text) return false;
    const normalized = text.toLowerCase()
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c");
    
    return BANNED_WORDS.some(word => {
        if (word.length <= 3) {
            return new RegExp(`\\b${word}\\b`, "i").test(normalized);
        }
        return normalized.includes(word);
    });
}

function getArticleReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_article_reports") || "{}");
    return reportsMap[id] || 0;
}

function reportArticle(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_article_reports") || "{}");
    reportsMap[id] = (reportsMap[id] || 0) + 1;
    localStorage.setItem("murekkep_article_reports", JSON.stringify(reportsMap));
    return reportsMap[id];
}

function resetArticleReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_article_reports") || "{}");
    reportsMap[id] = 0;
    localStorage.setItem("murekkep_article_reports", JSON.stringify(reportsMap));
}

function getCommentReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_comment_reports") || "{}");
    return reportsMap[id] || 0;
}

function reportComment(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_comment_reports") || "{}");
    reportsMap[id] = (reportsMap[id] || 0) + 1;
    localStorage.setItem("murekkep_comment_reports", JSON.stringify(reportsMap));
    return reportsMap[id];
}

function resetCommentReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_comment_reports") || "{}");
    reportsMap[id] = 0;
    localStorage.setItem("murekkep_comment_reports", JSON.stringify(reportsMap));
}

let isEditorModeActive = false;

function updateEditorBannerUI() {
    const banner = document.getElementById("editor-mode-banner");
    const toggleBtn = document.getElementById("settings-editor-toggle");
    if (isEditorModeActive && currentUser && currentUser.isEditor) {
        if (banner) banner.classList.remove("hidden");
        if (toggleBtn) toggleBtn.classList.add("active");
    } else {
        if (banner) banner.classList.add("hidden");
        if (toggleBtn) toggleBtn.classList.remove("active");
        isEditorModeActive = false;
    }
}

const SUPABASE_URL = "https://xhgtipmmahtoshypngdm.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ3RpcG1tYWh0b3NoeXBuZ2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDQyMzYsImV4cCI6MjA5Nzc4MDIzNn0.Z1eYqrrU8U62kDf0G8zUEBguXt4h0HviZJBIEJvH588";

let supabaseClient = null;
let isSupabaseConnected = false;

let currentUser = null;
let savedArticleIds = [];

const CACHE_KEY = "murekkep_supabase_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function clearSupabaseCache() {
    localStorage.removeItem(CACHE_KEY);
    console.log("Supabase client cache cleared.");
}

function updateSupabaseUI() {
    const statusText = document.getElementById("supabase-status-text");
    const configBtn = document.getElementById("supabase-config-btn");
    if (!statusText || !configBtn) return;

    if (isSupabaseConnected) {
        statusText.innerText = "Supabase: Bağlı";
        configBtn.style.backgroundColor = "rgba(46, 125, 50, 0.1)";
        configBtn.style.color = "#2e7d32";
        configBtn.style.borderColor = "#2e7d32";
    } else {
        statusText.innerText = "Supabase: Çevrimdışı";
        configBtn.style.backgroundColor = "";
        configBtn.style.color = "";
        configBtn.style.borderColor = "var(--border-color)";
    }
}

// Premium Toast Notification
function showToast(message) {
    const alertDiv = document.createElement("div");
    alertDiv.style.position = "fixed";
    alertDiv.style.bottom = "30px";
    alertDiv.style.right = "30px";
    alertDiv.style.backgroundColor = "var(--accent-color)";
    alertDiv.style.color = "#ffffff";
    alertDiv.style.padding = "16px 24px";
    alertDiv.style.borderRadius = "30px";
    alertDiv.style.fontFamily = "var(--font-ui)";
    alertDiv.style.fontWeight = "600";
    alertDiv.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
    alertDiv.style.zIndex = "2000";
    alertDiv.style.animation = "slideUp 0.3s ease";
    alertDiv.innerText = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        alertDiv.style.transition = "opacity 0.5s ease";
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// Authentication Overlay Controls
function openAuthModal() {
    if (authOverlay) {
        authOverlay.classList.remove("hidden");
        lockBodyScroll();
        switchAuthTab('login');
    }
}

function closeAuthModal() {
    if (authOverlay) {
        authOverlay.classList.add("hidden");
        unlockBodyScroll();
    }
}

// =============================================
// SHARE SYSTEM
// =============================================
let shareCurrentTemplate = 'gece';
let shareCurrentArticle = null;

/** Helper: update the share modal's quote display panel */
function setShareQuote(text) {
    const input   = document.getElementById('share-quote-input');
    if (input)    input.value = text ? text.trim().substring(0, 280) : '';
    renderShareCard(shareCurrentTemplate);
}

/** Populate the Spotify-style sentence selector list dynamically */
function populateShareSentences(article) {
    const listEl = document.getElementById("share-paragraphs-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = article.content;
    const paragraphs = tempDiv.querySelectorAll("p, blockquote");

    const sentences = [];
    paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (!text) return;
        
        // Clean extra spaces and split into sentences by punctuation (. ? !) followed by space or end
        const cleanText = text.replace(/\s+/g, ' ').trim();
        const matches = cleanText.match(/[^.!?]+[.!?]+(?=\s|$)/g);
        if (matches) {
            matches.forEach(s => {
                const cleanS = s.trim();
                if (cleanS) sentences.push(cleanS);
            });
        } else if (cleanText) {
            sentences.push(cleanText);
        }
    });

    if (sentences.length === 0) {
        listEl.innerHTML = `<div style="color:var(--text-secondary); font-size:0.8rem; text-align:center; padding:20px;">Bu makalede seçilebilir cümle bulunamadı.</div>`;
        return;
    }

    sentences.forEach((sentenceText, idx) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "share-paragraph-item"; // uses existing CSS class for paragraph item
        item.textContent = sentenceText;
        item.dataset.index = idx;

        item.addEventListener("click", () => {
            // Toggle selection
            item.classList.toggle("selected");

            // Compile all selected sentences in order with spaces
            const selectedItems = listEl.querySelectorAll(".share-paragraph-item.selected");
            const compiledText = Array.from(selectedItems)
                .map(el => el.textContent)
                .join(" ")
                .substring(0, 280);

            const quoteInput = document.getElementById("share-quote-input");
            if (quoteInput) {
                quoteInput.value = compiledText;
                quoteInput.dispatchEvent(new Event("input"));
            }
        });

        listEl.appendChild(item);
    });
}

function openShareModal(articleId, preselectedText) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    shareCurrentArticle = article;

    const overlay = document.getElementById('share-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    lockBodyScroll();

    // Populate sentences list
    populateShareSentences(article);

    // Populate quote: from preselected text only (no auto-fill from subtitle)
    setShareQuote(preselectedText || '');

    // Auto-select sentence containing the preselected text
    if (preselectedText) {
        const cleanPre = preselectedText.trim().toLowerCase();
        const items = document.querySelectorAll('.share-paragraph-item');
        items.forEach(item => {
            if (item.textContent.toLowerCase().includes(cleanPre) || cleanPre.includes(item.textContent.toLowerCase())) {
                item.classList.add('selected');
            }
        });
    }
}

function closeShareModal() {
    const overlay = document.getElementById("share-overlay");
    if (overlay) {
        overlay.classList.add("hidden");
        unlockBodyScroll();
    }
}

// Canvas text wrapping helper
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push({ text: line.trim(), y: currentY });
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    lines.push({ text: line.trim(), y: currentY });
    lines.forEach(l => ctx.fillText(l.text, x, l.y));
    return currentY + lineHeight;
}

// Render a share card on canvas
function renderShareCard(template) {
    const canvas = document.getElementById("share-canvas");
    if (!canvas || !shareCurrentArticle) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    const quoteInput = document.getElementById("share-quote-input");
    const quoteText = (quoteInput && quoteInput.value.trim()) ? quoteInput.value.trim() : "";
    const articleTitle = shareCurrentArticle.title || "";
    const authorName = shareCurrentArticle.author || "Mürekkep";

    // Template definitions
    const templates = {
        gece: {
            bgColors: ['#0f0f0f', '#1a1a1a'],
            angle: 0,
            textColor: '#e2ddd5',
            accentColor: '#c94040',
            logoColor: '#e2ddd5',
            subtleColor: '#666666',
            borderColor: '#333333',
            quoteMarkColor: 'rgba(93,26,26,0.6)',
        },
        sabah: {
            bgColors: ['#faf8f5', '#f0ebe0'],
            angle: 0,
            textColor: '#111111',
            accentColor: '#5d1a1a',
            logoColor: '#111111',
            subtleColor: '#888888',
            borderColor: '#d8d2c4',
            quoteMarkColor: 'rgba(93,26,26,0.15)',
        },
        gazete: {
            bgColors: ['#f3efe6', '#e8e0cc'],
            angle: 0,
            textColor: '#2c1a00',
            accentColor: '#2c1a00',
            logoColor: '#2c1a00',
            subtleColor: '#8a7560',
            borderColor: '#c8b898',
            quoteMarkColor: 'rgba(44,26,0,0.12)',
            italic: true,
        },
        yangin: {
            bgColors: ['#1a0000', '#6b0f0f', '#c0390f'],
            angle: 135,
            textColor: '#fff8e1',
            accentColor: '#ff6b35',
            logoColor: '#fff8e1',
            subtleColor: '#ff9a70',
            borderColor: '#ff4500',
            quoteMarkColor: 'rgba(255,107,53,0.25)',
        },
        okyanus: {
            bgColors: ['#0d1b2a', '#1b4f72', '#2471a3'],
            angle: 135,
            textColor: '#e8f4f8',
            accentColor: '#5dade2',
            logoColor: '#e8f4f8',
            subtleColor: '#85c1e9',
            borderColor: '#2980b9',
            quoteMarkColor: 'rgba(93,173,226,0.25)',
        }
    };

    const t = templates[template] || templates.gece;
    const pad = 90;

    // ── Background ──
    if (t.bgColors.length > 1) {
        let grad;
        if (t.angle === 135) {
            grad = ctx.createLinearGradient(0, 0, W, H);
        } else {
            grad = ctx.createLinearGradient(0, 0, 0, H);
        }
        t.bgColors.forEach((c, i) => grad.addColorStop(i / (t.bgColors.length - 1), c));
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = t.bgColors[0];
    }
    ctx.fillRect(0, 0, W, H);

    // ── Top border line ──
    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, 130);
    ctx.lineTo(W - pad, 130);
    ctx.stroke();

    // ── Logo / Title ──
    ctx.fillStyle = t.logoColor;
    ctx.font = `900 72px 'Cinzel', Georgia, serif`;
    if (t.italic) ctx.font = `italic 900 72px 'Cinzel', Georgia, serif`;
    ctx.fillText('MÜREKKEP', pad, 110);

    let lastY = H - 240;

    if (quoteText) {
        // ── Decorative quote mark (large ❝) ──
        ctx.fillStyle = t.quoteMarkColor;
        ctx.font = 'bold 500px serif';
        ctx.fillText('"', pad - 30, 420);

        // ── Quote text ──
        ctx.fillStyle = t.textColor;
        const fontSize = quoteText.length > 120 ? 46 : quoteText.length > 80 ? 54 : 62;
        ctx.font = `${t.italic ? 'italic ' : ''}${fontSize}px 'Playfair Display', Georgia, serif`;
        ctx.textBaseline = 'top';
        lastY = wrapCanvasText(ctx, `"${quoteText}"`, pad, 220, W - pad * 2, fontSize * 1.5);
    } else {
        // ── Draw Article Poster/Cover layout in the middle ──
        ctx.textAlign = 'center';
        
        // Category Tag
        ctx.fillStyle = t.accentColor;
        ctx.font = `700 32px 'Inter', sans-serif`;
        ctx.fillText(shareCurrentArticle.category.replace("-", " ").toUpperCase(), W / 2, 360);
        
        // Article Title
        ctx.fillStyle = t.textColor;
        const titleFontSize = articleTitle.length > 50 ? 52 : articleTitle.length > 30 ? 60 : 70;
        ctx.font = `900 ${titleFontSize}px 'Cinzel', Georgia, serif`;
        const titleY = 430;
        const endTitleY = wrapCanvasText(ctx, articleTitle, W / 2, titleY, W - pad * 2.5, titleFontSize * 1.4);
        
        // Subtitle (if fits and space allows)
        const subtitleText = shareCurrentArticle.subtitle || "";
        if (subtitleText && endTitleY < 720) {
            ctx.fillStyle = t.subtleColor;
            const subFontSize = 36;
            ctx.font = `italic ${subFontSize}px 'Playfair Display', Georgia, serif`;
            wrapCanvasText(ctx, subtitleText, W / 2, endTitleY + 30, W - pad * 3, subFontSize * 1.4);
        }
        
        ctx.textAlign = 'left'; // Restore alignment
        lastY = H - 240;
    }

    // ── Bottom border line ──
    const bottomBorderY = Math.min(lastY + 60, H - 220);
    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, bottomBorderY);
    ctx.lineTo(W - pad, bottomBorderY);
    ctx.stroke();

    // ── Accent line ──
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(pad, bottomBorderY + 10);
    ctx.lineTo(pad + 120, bottomBorderY + 10);
    ctx.stroke();

    // ── Author name ──
    ctx.fillStyle = t.subtleColor;
    ctx.font = `italic 500 36px 'Playfair Display', Georgia, serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`— ${authorName}`, pad, bottomBorderY + 60);

    // ── Article title (smaller, below author) ──
    ctx.fillStyle = t.subtleColor;
    ctx.font = `400 30px 'Lora', Georgia, serif`;
    const shortTitle = articleTitle.length > 55 ? articleTitle.substring(0, 55) + '…' : articleTitle;
    ctx.fillText(shortTitle, pad, bottomBorderY + 108);

    // ── Bottom site tag ──
    ctx.fillStyle = t.accentColor;
    ctx.font = `700 28px 'Inter', sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('murekkep.com', W - pad, H - pad);
    ctx.textAlign = 'left';
}

// =============================================
// SPOTIFY-STYLE TEXT SELECTION POPUP
// =============================================

function initTextSelectionPopup() {
    const popup = document.getElementById('text-selection-popup');
    const previewEl = document.getElementById('tsp-preview-text');
    const shareBtn = document.getElementById('tsp-share-btn');
    const copyBtn = document.getElementById('tsp-copy-btn');
    const tweetBtn = document.getElementById('tsp-tweet-btn');
    if (!popup) return;

    let lastSelectedText = '';
    let hideTimeout = null;

    function showPopup(selectedText, rect) {
        lastSelectedText = selectedText.trim();
        if (!lastSelectedText || lastSelectedText.length < 3) { hidePopup(); return; }

        // Truncate preview to ~80 chars
        previewEl.textContent = lastSelectedText.length > 80
            ? '"' + lastSelectedText.substring(0, 80) + '…"'
            : '"' + lastSelectedText + '"';

        popup.classList.remove('hidden');

        // Position: centered above the selection, clamped inside viewport
        // popup is position:fixed → use viewport (rect) coords directly
        const POPUP_W = Math.min(340, window.innerWidth - 24);
        const POPUP_H = 92;
        const ARROW_H = 10;

        let left = rect.left + rect.width / 2 - POPUP_W / 2;
        let top  = rect.top - POPUP_H - ARROW_H;

        // If there's not enough room above, flip below
        if (top < 8) {
            top = rect.bottom + ARROW_H;
        }

        // Clamp horizontally & vertically
        left = Math.max(12, Math.min(left, window.innerWidth - POPUP_W - 12));
        top  = Math.max(8, top);

        popup.style.left = left + 'px';
        popup.style.top  = top + 'px';
        popup.style.width = POPUP_W + 'px';
    }

    function hidePopup() {
        popup.classList.add('hidden');
        lastSelectedText = '';
    }

    // ── Listen for selections inside the reading overlay ──────────────────
    const readingOverlay = document.getElementById('reading-overlay');
    if (!readingOverlay) return;

    function handleSelectionChange() {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || !sel.toString().trim()) {
                hidePopup();
                return;
            }

            // Only trigger if selection is inside the reading overlay
            const anchorNode = sel.anchorNode;
            if (!readingOverlay.contains(anchorNode)) { hidePopup(); return; }

            try {
                const range = sel.getRangeAt(0);
                const rect  = range.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) { hidePopup(); return; }
                showPopup(sel.toString(), rect);
            } catch(e) { hidePopup(); }
        }, 50);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    readingOverlay.addEventListener('scroll', handleSelectionChange);

    // Hide on clicking elsewhere (but not on the popup itself)
    document.addEventListener('mousedown', (e) => {
        if (!popup.contains(e.target)) hidePopup();
    });
    document.addEventListener('touchstart', (e) => {
        if (!popup.contains(e.target)) hidePopup();
    });

    // ESC key hides
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hidePopup();
    });

    // ── SHARE button → open share modal with selected text ────────────────
    shareBtn?.addEventListener('click', () => {
        if (!lastSelectedText) return;
        const selectedText = lastSelectedText;
        hidePopup();
        window.getSelection()?.removeAllRanges();

        if (!activeArticleId) return;
        // Open share modal and inject selected text
        openShareModal(activeArticleId, selectedText);
    });

    // ── COPY button ───────────────────────────────────────────────────────
    copyBtn?.addEventListener('click', () => {
        if (!lastSelectedText) return;
        const textToCopy = `"${lastSelectedText}"`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => showToast('📋 Alıntı kopyalandı!'))
            .catch(() => showToast('Kopyalama başarısız.'));
        hidePopup();
        window.getSelection()?.removeAllRanges();
    });

    // ── TWEET button ──────────────────────────────────────────────────────
    tweetBtn?.addEventListener('click', () => {
        if (!lastSelectedText) return;
        const art = articles.find(a => a.id === activeArticleId);
        const author = art ? `— ${art.author}` : '';
        const tweet = `"${lastSelectedText.substring(0, 200)}" ${author} #Mürekkep\nmurekkep.com`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
        hidePopup();
        window.getSelection()?.removeAllRanges();
    });
}

// =============================================
// SHARE SYSTEM
// =============================================

function initShareOverlay() {
    const overlay = document.getElementById("share-overlay");
    const closeBtn = document.getElementById("close-share");
    const quoteInput = document.getElementById("share-quote-input");
    const thumbs = document.querySelectorAll(".share-template-thumb");

    // Close button
    if (closeBtn) closeBtn.addEventListener("click", closeShareModal);

    // Backdrop click
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeShareModal();
        });
    }

    // Clear quote button
    document.getElementById('share-quote-clear')?.addEventListener('click', () => {
        setShareQuote('');
    });

    // Template thumb selection
    thumbs.forEach(thumb => {
        thumb.addEventListener("click", () => {
            thumbs.forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
            shareCurrentTemplate = thumb.getAttribute("data-template");
            renderShareCard(shareCurrentTemplate);
        });
    });

    // Live re-render as user edits quote
    if (quoteInput) {
        quoteInput.addEventListener("input", () => {
            renderShareCard(shareCurrentTemplate);
        });
    }

    // WhatsApp share
    document.getElementById("share-whatsapp")?.addEventListener("click", () => {
        if (!shareCurrentArticle) return;
        const q = quoteInput?.value.trim() || shareCurrentArticle.subtitle || shareCurrentArticle.title;
        const text = `"${q}"\n\n— ${shareCurrentArticle.author}\n📖 ${shareCurrentArticle.title}\n\nmurekkep.com`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    });

    // Twitter/X share
    document.getElementById("share-twitter")?.addEventListener("click", () => {
        if (!shareCurrentArticle) return;
        const q = quoteInput?.value.trim() || shareCurrentArticle.subtitle || shareCurrentArticle.title;
        const text = `"${q}"\n\n— ${shareCurrentArticle.author} | #Mürekkep`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    });

    // Instagram — download image
    document.getElementById("share-instagram")?.addEventListener("click", () => {
        const canvas = document.getElementById("share-canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `murekkep-paylasim.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("📥 Görsel indirildi! Instagram'da paylaşabilirsiniz.");
    });

    // Copy link
    document.getElementById("share-copy-link")?.addEventListener("click", () => {
        const url = window.location.href.split("?")[0];
        navigator.clipboard.writeText(url).then(() => {
            showToast("🔗 Link kopyalandı!");
        }).catch(() => {
            showToast("Link: " + url);
        });
    });

    // Native share image
    document.getElementById("share-native-image")?.addEventListener("click", () => {
        const canvas = document.getElementById("share-canvas");
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], 'murekkep-paylasim.png', { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'Mürekkep Alıntı',
                    text: 'Mürekkep Gazetesi\'nden edebi bir alıntı paylaştı.'
                }).catch(err => {
                    console.log("Paylaşım iptal edildi veya hata oluştu:", err);
                });
            } else {
                // Fallback: Download the image
                const link = document.createElement("a");
                link.download = `murekkep-paylasim.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                showToast("📥 Cihazınız doğrudan görsel paylaşımını desteklemediği için indirildi.");
            }
        }, 'image/png');
    });
}

// Settings Modal
function openSettingsModal() {
    const settingsOverlay = document.getElementById("settings-overlay");
    if (!settingsOverlay) return;
    
    // Reset active tab to info
    window.switchProfileTab("info");

    // Populate fields with current user data
    if (currentUser) {
        const displayName = currentUser.username || currentUser.email.split("@")[0];
        const usernameInput = document.getElementById("settings-username-input");
        if (usernameInput) usernameInput.value = displayName;
    }
    
    // Sync theme toggle state
    const themeToggleInSettings = document.getElementById("settings-theme-toggle");
    if (themeToggleInSettings) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            themeToggleInSettings.classList.add("active");
        } else {
            themeToggleInSettings.classList.remove("active");
        }
    }

    // Sync editor toggle state
    const editorToggleInSettings = document.getElementById("settings-editor-toggle");
    const editorSection = document.getElementById("settings-editor-section");
    const editorDivider = document.getElementById("settings-editor-divider");
    
    if (currentUser && currentUser.isEditor) {
        if (editorSection) editorSection.classList.remove("hidden");
        if (editorDivider) editorDivider.classList.remove("hidden");
        if (editorToggleInSettings) {
            if (isEditorModeActive) {
                editorToggleInSettings.classList.add("active");
            } else {
                editorToggleInSettings.classList.remove("active");
            }
        }
    } else {
        if (editorSection) editorSection.classList.add("hidden");
        if (editorDivider) editorDivider.classList.add("hidden");
    }

    // Render Profile Tab Content
    renderProfileTabUI();

    settingsOverlay.classList.remove("hidden");
    lockBodyScroll();
}

// Support function: switch profile modal tabs
window.switchProfileTab = function(tabName) {
    const tabBtns = document.querySelectorAll(".profile-tab-btn");
    const tabPanels = document.querySelectorAll(".profile-tab-panel");
    tabBtns.forEach(btn => {
        if (btn.getAttribute("data-tab") === tabName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    tabPanels.forEach(panel => {
        if (panel.id === `panel-${tabName}`) {
            panel.classList.remove("hidden");
        } else {
            panel.classList.add("hidden");
        }
    });
};

// Support function: get follower count of an author
function getAuthorFollowerCount(authorName) {
    if (!authorName) return 0;
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    return (followersData[authorName] || []).length;
}

// Support function: get list of authors followed by the user
function getFollowingAuthors() {
    if (!currentUser) return [];
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    
    const list = [];
    for (const authorName in followersData) {
        if (Array.isArray(followersData[authorName]) && followersData[authorName].some(f => {
            if (typeof f === 'string') return f === currentUser.id;
            return f && f.id === currentUser.id;
        })) {
            list.push(authorName);
        }
    }
    return list;
}

// Support function: Toggle follow state without opening author modal (for profile listings)
function toggleFollowState(authorName) {
    if (!currentUser) {
        openAuthModal();
        showToast("Yazarları takip edebilmek için lütfen giriş yapın.");
        return false;
    }
    
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    
    if (!followersData[authorName]) {
        followersData[authorName] = [];
    }
    
    const index = followersData[authorName].findIndex(f => {
        if (typeof f === 'string') return f === currentUser.id;
        return f && f.id === currentUser.id;
    });
    const isFollowing = index !== -1;
    
    if (isFollowing) {
        followersData[authorName].splice(index, 1);
        showToast(`🔕 ${authorName} takipten çıkarıldı.`);
    } else {
        followersData[authorName].push({ id: currentUser.id, username: currentUser.username });
        showToast(`🔔 ${authorName} takip ediliyor!`);
        createNotification(authorName, 'follow', currentUser.username, 'sizi takip etmeye başladı.');
    }
    
    localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
    saveAuthorFollowers(followersData);
    return true;
}

// Toggle follow action inside the profile tab
window.toggleFollowFromProfile = function(authorName) {
    if (toggleFollowState(authorName)) {
        renderProfileTabUI();
        
        // If author profile modal is open, refresh it as well to keep in sync
        const authorModal = document.getElementById("author-modal");
        if (authorModal && !authorModal.classList.contains("hidden")) {
            const authorModalName = document.getElementById("author-modal-name");
            if (authorModalName && authorModalName.innerText === authorName) {
                window.openAuthorProfile(authorName);
            }
        }
    }
};

// Render full profile tab contents dynamically
function renderProfileTabUI() {
    if (!currentUser) return;
    const displayName = currentUser.username || currentUser.email.split("@")[0];
    const initial = displayName.substring(0, 1).toUpperCase();
    
    // 1. Populate top profile info
    const avatarEl = document.getElementById("profile-avatar-large");
    const nameLabel = document.getElementById("profile-display-name");
    const emailLabel = document.getElementById("profile-display-email");
    
    if (avatarEl) avatarEl.innerText = initial;
    if (nameLabel) nameLabel.innerText = displayName;
    if (emailLabel) emailLabel.innerText = currentUser.email || "";

    // Calculate stats
    // 1.1 Articles or bookmarks
    const stats = getAuthorStats(currentUser.username);
    const isWriter = stats.totalArticles > 0;
    
    let articleCountVal = 0;
    if (isWriter) {
        articleCountVal = stats.totalArticles;
    } else {
        articleCountVal = savedArticleIds.length;
    }
    
    const statBoxArticles = document.getElementById("profile-stat-box-articles");
    const statArticlesVal = document.getElementById("profile-stat-articles-val");
    const statArticlesLabel = statBoxArticles ? statBoxArticles.querySelector("div:last-child") : null;
    
    if (statArticlesVal) statArticlesVal.innerText = articleCountVal;
    if (statArticlesLabel) {
        statArticlesLabel.innerText = isWriter ? "ESERLERİM" : "KAYDEDİLENLER";
    }

    // Bind click to redirect from stats row to relevant tab or view
    if (statBoxArticles) {
        statBoxArticles.onclick = () => {
            if (isWriter) {
                window.switchProfileTab("writer");
            } else {
                closeSettingsModal();
                filterCategory("bookmarks");
            }
        };
    }

    // 1.2 Followers Count
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    
    const userFollowersList = followersData[currentUser.username] || [];
    const statFollowersVal = document.getElementById("profile-stat-followers-val");
    if (statFollowersVal) statFollowersVal.innerText = userFollowersList.length;

    // 1.3 Following Count
    const followingList = getFollowingAuthors();
    const statFollowingVal = document.getElementById("profile-stat-following-val");
    const statBoxFollowing = document.getElementById("profile-stat-box-following");
    if (statFollowingVal) statFollowingVal.innerText = followingList.length;
    if (statBoxFollowing) {
        statBoxFollowing.onclick = () => {
            window.switchProfileTab("following");
        };
    }

    // 2. Tab: Yazar Serüveni Visibility Control
    const writerTabBtn = document.getElementById("profile-tab-writer");
    if (writerTabBtn) {
        if (isWriter) {
            writerTabBtn.style.display = "block";
        } else {
            writerTabBtn.style.display = "none";
            // If the active tab was writer but they are no longer a writer, switch to info
            const activeTab = document.querySelector(".profile-tab-btn.active");
            if (activeTab && activeTab.getAttribute("data-tab") === "writer") {
                window.switchProfileTab("info");
            }
        }
    }

    // 3. Render Following List inside Panel 2
    const followingContainer = document.getElementById("profile-following-list");
    if (followingContainer) {
        followingContainer.innerHTML = "";
        if (followingList.length === 0) {
            followingContainer.innerHTML = `
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; font-style: italic; padding: 25px 10px; background: rgba(0,0,0,0.01); border-radius: 8px; border: 1px dashed var(--border-light);">
                    Henüz takip ettiğiniz yazar bulunmuyor. Edebiyatçılarımızın eserlerini kaçırmamak için onları takip edebilirsiniz.
                </div>
            `;
        } else {
            followingList.forEach(author => {
                const item = document.createElement("div");
                item.className = "follow-user-item";
                const authorStats = getAuthorStats(author);
                const authBadge = getAuthorRankBadgeHtml(author);
                const initial = author.substring(0, 1).toUpperCase();
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;" onclick="closeSettingsModal(); window.openAuthorProfile('${author.replace(/'/g, "\\'")}')">
                        ${getAuthorAvatarHtml(author, 36)}
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span style="text-decoration: underline; text-underline-offset: 2px;">${author}</span> ${authBadge}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;">👏 ${authorStats.totalClaps} Alkış | ${authorStats.totalArticles} Eser</div>
                        </div>
                    </div>
                    <button class="follow-user-btn follow-user-btn-unfollow" onclick="window.toggleFollowFromProfile('${author.replace(/'/g, "\\'")}')">Takipten Çık</button>
                `;
                followingContainer.appendChild(item);
            });
        }
    }

    // 4. Render Recommended Authors
    const recommendedContainer = document.getElementById("profile-recommended-list");
    if (recommendedContainer) {
        recommendedContainer.innerHTML = "";
        
        // Find all unique authors from system articles
        const allAuthors = [];
        articles.forEach(art => {
            if (art.author && !allAuthors.includes(art.author)) {
                allAuthors.push(art.author);
            }
        });

        // Filter out current user and already followed authors
        const recList = allAuthors.filter(author => {
            const isSelf = author.toLowerCase().trim() === currentUser.username.toLowerCase().trim();
            const isAlreadyFollowed = followingList.includes(author);
            return !isSelf && !isAlreadyFollowed;
        });

        // Sort by popularity (total claps)
        const sortedRecs = recList.map(author => {
            const authorStats = getAuthorStats(author);
            return { name: author, stats: authorStats };
        }).sort((a, b) => b.stats.totalClaps - a.stats.totalClaps).slice(0, 4);

        if (sortedRecs.length === 0) {
            recommendedContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; font-style: italic; padding: 15px 0;">Önerilecek yeni yazar bulunamadı.</p>`;
        } else {
            sortedRecs.forEach(rec => {
                const item = document.createElement("div");
                item.className = "follow-user-item";
                const authBadge = getAuthorRankBadgeHtml(rec.name);
                const initial = rec.name.substring(0, 1).toUpperCase();
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;" onclick="closeSettingsModal(); window.openAuthorProfile('${rec.name.replace(/'/g, "\\'")}')">
                        ${getAuthorAvatarHtml(rec.name, 36)}
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span style="text-decoration: underline; text-underline-offset: 2px;">${rec.name}</span> ${authBadge}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;">👏 ${rec.stats.totalClaps} Alkış | ${rec.stats.totalArticles} Eser</div>
                        </div>
                    </div>
                    <button class="follow-user-btn follow-user-btn-follow" onclick="window.toggleFollowFromProfile('${rec.name.replace(/'/g, "\\'")}')">Takip Et</button>
                `;
                recommendedContainer.appendChild(item);
            });
        }
    }

    // 5. Populate Writer Dashboard Stats if active
    if (isWriter) {
        const statsWriter = getAuthorStats(currentUser.username);
        
        const rankIcon = document.getElementById("writer-rank-icon");
        const rankName = document.getElementById("writer-rank-name");
        const rankDesc = document.getElementById("writer-rank-desc");
        
        const isEditor = (currentUser.isEditor || (currentUser.username && (normalizeTurkishString(currentUser.username) === "murekkep editoru" || normalizeTurkishString(currentUser.username) === "editor" || normalizeTurkishString(currentUser.username) === "editör")));
        const rankCard = document.getElementById("writer-rank-card");
        const rankProgressBox = document.getElementById("writer-rank-progress-box");

        if (isEditor) {
            if (rankCard) rankCard.style.display = "none";
            if (rankProgressBox) rankProgressBox.style.display = "none";
        } else {
            if (rankCard) rankCard.style.display = "flex";
            if (rankProgressBox) rankProgressBox.style.display = "block";

            if (rankIcon) rankIcon.innerText = statsWriter.rank.icon;
            if (rankName) rankName.innerText = statsWriter.rank.label;
            if (rankDesc) rankDesc.innerText = statsWriter.rank.description;
            
            // Progress Bar
            const progressLabel = document.getElementById("writer-progress-label");
            const progressPct = document.getElementById("writer-progress-pct");
            const progressBar = document.getElementById("writer-progress-bar");
            const progressDetails = document.getElementById("writer-progress-details");
            
            if (statsWriter.rank.nextRank) {
                const xpCurrent = statsWriter.rank.xp;
                const xpNext = statsWriter.rank.nextRank.reqXp;
                const xpPrev = statsWriter.rank.reqXp;
                
                const earnedXp = xpCurrent - xpPrev;
                const neededXp = xpNext - xpPrev;
                const pct = Math.min(100, Math.max(0, Math.round((earnedXp / neededXp) * 100)));
                
                if (progressLabel) progressLabel.innerText = `Sonraki Derece: ${statsWriter.rank.nextRank.label}`;
                if (progressPct) progressPct.innerText = `${pct}%`;
                if (progressBar) progressBar.style.width = `${pct}%`;
                if (progressDetails) progressDetails.innerText = `Edebi Puan (XP): ${xpCurrent} / ${xpNext} XP`;
            } else {
                if (progressLabel) progressLabel.innerText = `Zirve Derece: Mürekkep Efsanesi`;
                if (progressPct) progressPct.innerText = `100%`;
                if (progressBar) progressBar.style.width = `100%`;
                if (progressDetails) progressDetails.innerText = `Edebi olgunluğun zirvesine ulaşıldı! (Toplam XP: ${statsWriter.rank.xp})`;
            }
        }
        
        // Stats Grid
        const statArticles = document.getElementById("writer-stat-articles");
        const statClaps = document.getElementById("writer-stat-claps");
        const statReadtime = document.getElementById("writer-stat-readtime");
        
        if (statArticles) statArticles.innerText = statsWriter.totalArticles;
        if (statClaps) statClaps.innerText = statsWriter.totalClaps;
        if (statReadtime) statReadtime.innerText = `${statsWriter.totalReadTime} dk`;
        
        // Goal Sync
        const goalVal = localStorage.getItem(`murekkep_writer_goal_${currentUser.id}`) || "1";
        const goalSelect = document.getElementById("writer-goal-select");
        if (goalSelect) goalSelect.value = goalVal;
        
        // Calculate goal progress for last 7 days
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const authorArticles = articles.filter(a => a.author && a.author.trim().toLowerCase() === currentUser.username.trim().toLowerCase());
        
        let last7DaysCount = 0;
        const months = {
            "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
            "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11
        };
        
        authorArticles.forEach(art => {
            const parts = art.date.split(" ");
            if (parts.length >= 3) {
                const day = parseInt(parts[0]);
                const monthStr = parts[1];
                const year = parseInt(parts[2]);
                const month = months[monthStr] !== undefined ? months[monthStr] : 5;
                const artDate = new Date(year, month, day);
                const diffDays = Math.round(Math.abs((now - artDate) / oneDay));
                if (diffDays <= 7) {
                    last7DaysCount++;
                }
            }
        });
        
        const goalLimit = parseInt(goalVal) || 1;
        const goalPct = Math.min(100, Math.round((last7DaysCount / goalLimit) * 100));
        
        const goalStatusEl = document.getElementById("writer-goal-status");
        const goalBarEl = document.getElementById("writer-goal-bar");
        
        if (goalStatusEl) goalStatusEl.innerText = `${last7DaysCount} / ${goalLimit} Eser`;
        if (goalBarEl) goalBarEl.style.width = `${goalPct}%`;
        
        const streakKey = `murekkep_writer_streak_${currentUser.id}`;
        let streak = parseInt(localStorage.getItem(streakKey) || "0");
        if (last7DaysCount >= goalLimit && streak === 0) {
            streak = 1;
            localStorage.setItem(streakKey, "1");
        }
        const streakEl = document.getElementById("writer-goal-streak-val");
        if (streakEl) streakEl.innerText = streak;
    }
}

function closeSettingsModal() {
    const settingsOverlay = document.getElementById("settings-overlay");
    if (settingsOverlay) {
        settingsOverlay.classList.add("hidden");
        unlockBodyScroll();
    }
}

// Switch tabs between login and register inside auth card
window.switchAuthTab = function(tab) {
    if (tab === 'login') {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        
        tabLogin.style.color = "var(--text-primary)";
        tabLogin.style.borderBottomColor = "var(--accent-color)";
        tabRegister.style.color = "var(--text-secondary)";
        tabRegister.style.borderBottomColor = "transparent";
    } else {
        tabLogin.classList.remove("active");
        tabRegister.classList.add("active");
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        
        tabRegister.style.color = "var(--text-primary)";
        tabRegister.style.borderBottomColor = "var(--accent-color)";
        tabLogin.style.color = "var(--text-secondary)";
        tabLogin.style.borderBottomColor = "transparent";
    }
};

// Check and update auth UI state
function updateAuthUI() {
    const editorSection = document.getElementById("settings-editor-section");
    const editorDivider = document.getElementById("settings-editor-divider");
    const configBtn = document.getElementById("supabase-config-btn");
    const notificationsSection = document.getElementById("notifications-section");

    const categoriesSection = document.getElementById("settings-categories-section");
    const categoriesDivider = document.getElementById("settings-categories-divider");
    const layoutSection = document.getElementById("settings-layout-section");
    const layoutDivider = document.getElementById("settings-layout-divider");
    const usersSection = document.getElementById("settings-users-section");
    const usersDivider = document.getElementById("settings-users-divider");

    if (currentUser) {
        // Logged in — show profile dropdown, hide login button
        if (loginToggleBtn) loginToggleBtn.classList.add("hidden");
        if (userProfileSection) {
            userProfileSection.classList.remove("hidden");
        }
        if (notificationsSection) {
            notificationsSection.classList.remove("hidden");
        }
        loadNotifications();
        
        const displayName = currentUser.username || currentUser.email.split("@")[0];
        const initial = displayName.substring(0, 1).toUpperCase();
        
        // Populate dropdown elements
        const profile = getAuthorProfileData(displayName);
        if (userAvatarCircle) {
            userAvatarCircle.innerText = "";
            userAvatarCircle.style.backgroundImage = "";
            userAvatarCircle.style.background = "";
            if (profile.avatarType === "image" && profile.avatarVal) {
                userAvatarCircle.style.backgroundImage = `url('${profile.avatarVal}')`;
                userAvatarCircle.style.backgroundSize = "cover";
                userAvatarCircle.style.backgroundPosition = "center";
            } else if (profile.avatarType === "emoji" && profile.avatarVal) {
                userAvatarCircle.innerText = profile.avatarVal;
                userAvatarCircle.style.background = "var(--bg-secondary)";
            } else {
                userAvatarCircle.innerText = initial;
                userAvatarCircle.style.background = profile.avatarVal || "var(--accent-color)";
            }
        }
        if (userDisplayName)    userDisplayName.innerText    = displayName;
        
        if (dropdownAvatarLarge) {
            dropdownAvatarLarge.innerText = "";
            dropdownAvatarLarge.style.backgroundImage = "";
            dropdownAvatarLarge.style.background = "";
            if (profile.avatarType === "image" && profile.avatarVal) {
                dropdownAvatarLarge.style.backgroundImage = `url('${profile.avatarVal}')`;
                dropdownAvatarLarge.style.backgroundSize = "cover";
                dropdownAvatarLarge.style.backgroundPosition = "center";
            } else if (profile.avatarType === "emoji" && profile.avatarVal) {
                dropdownAvatarLarge.innerText = profile.avatarVal;
                dropdownAvatarLarge.style.background = "var(--bg-secondary)";
            } else {
                dropdownAvatarLarge.innerText = initial;
                dropdownAvatarLarge.style.background = profile.avatarVal || "var(--accent-color)";
            }
        }
        if (dropdownUserName)   dropdownUserName.innerText   = displayName;
        if (dropdownUserEmail)  dropdownUserEmail.innerText  = currentUser.email || "";
        
        // Show Bookmarks Tab
        if (bookmarksTab) bookmarksTab.classList.remove("hidden");

        // Editor panel control
        if (currentUser.isEditor) {
            if (editorSection) editorSection.classList.remove("hidden");
            if (editorDivider) editorDivider.classList.remove("hidden");
        } else {
            if (editorSection) editorSection.classList.add("hidden");
            if (editorDivider) editorDivider.classList.add("hidden");
            isEditorModeActive = false;
            updateEditorBannerUI();
        }

        // Admin panel control (Categories, Layout, Users, Supabase Config)
        if (currentUser.isAdmin) {
            if (configBtn) configBtn.classList.remove("hidden");
            if (categoriesSection) categoriesSection.classList.remove("hidden");
            if (categoriesDivider) categoriesDivider.classList.remove("hidden");
            if (layoutSection) layoutSection.classList.remove("hidden");
            if (layoutDivider) layoutDivider.classList.remove("hidden");
            if (usersSection) usersSection.classList.remove("hidden");
            if (usersDivider) usersDivider.classList.remove("hidden");
            if (typeof renderUsersManagementUI === 'function') {
                renderUsersManagementUI();
            }
        } else {
            if (configBtn) configBtn.classList.add("hidden");
            if (categoriesSection) categoriesSection.classList.add("hidden");
            if (categoriesDivider) categoriesDivider.classList.add("hidden");
            if (layoutSection) layoutSection.classList.add("hidden");
            if (layoutDivider) layoutDivider.classList.add("hidden");
            if (usersSection) usersSection.classList.add("hidden");
            if (usersDivider) usersDivider.classList.add("hidden");
        }

    } else {
        // Logged out / Guest
        if (loginToggleBtn) loginToggleBtn.classList.remove("hidden");
        if (userProfileSection) userProfileSection.classList.add("hidden");
        if (notificationsSection) notificationsSection.classList.add("hidden");
        if (configBtn) configBtn.classList.add("hidden");
        // Close dropdown if open
        toggleProfileDropdown(true);
        
        // Hide Bookmarks Tab
        if (bookmarksTab) {
            bookmarksTab.classList.add("hidden");
            if (currentCategoryFilter === "bookmarks") {
                filterCategory("all");
            }
        }

        // Hide admin/editor controls
        if (editorSection) editorSection.classList.add("hidden");
        if (editorDivider) editorDivider.classList.add("hidden");
        if (categoriesSection) categoriesSection.classList.add("hidden");
        if (categoriesDivider) categoriesDivider.classList.add("hidden");
        if (layoutSection) layoutSection.classList.add("hidden");
        if (layoutDivider) layoutDivider.classList.add("hidden");
        if (usersSection) usersSection.classList.add("hidden");
        if (usersDivider) usersDivider.classList.add("hidden");
        isEditorModeActive = false;
        updateEditorBannerUI();
    }
    
    // Refresh the comment form state (show/hide login prompt)
    if (typeof updateCommentFormUI === 'function') {
        updateCommentFormUI();
    }
    renderCategoriesDropdown();

    // Refresh active newspaper grid/feed with the new authentication state
    if (layoutConfig) {
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }
}


// Bookmarking data management
function loadBookmarks() {
    if (!currentUser) return;
    try {
        savedArticleIds = JSON.parse(localStorage.getItem("murekkep_bookmarks_" + currentUser.id) || "[]");
    } catch (e) {
        savedArticleIds = [];
    }
    updateBookmarkBtnUI();
}

function saveBookmarks() {
    if (!currentUser) return;
    try {
        localStorage.setItem("murekkep_bookmarks_" + currentUser.id, JSON.stringify(savedArticleIds));
    } catch (e) {
        console.warn("Failed to save bookmarks locally:", e);
    }
    updateBookmarkBtnUI();
}

function updateBookmarkBtnUI() {
    if (!articleSaveBtn) return;
    if (activeArticleId && savedArticleIds.includes(activeArticleId)) {
        articleSaveBtn.classList.add("saved");
    } else {
        articleSaveBtn.classList.remove("saved");
    }
}

// Initialize Auth Session
async function initAuth() {
    // Admin/Editor mock login bypass
    try {
        const localSession = localStorage.getItem("murekkep_mock_session");
        if (localSession) {
            const parsed = JSON.parse(localSession);
            if (parsed) {
                const role = getUserRole(parsed.email);
                currentUser = parsed;
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                loadBookmarks();
                updateAuthUI();
                return;
            }
        }
    } catch (e) {}

    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                currentUser = {
                    id: session.user.id,
                    email: session.user.email,
                    username: session.user.user_metadata?.username || session.user.email.split("@")[0]
                };
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                loadBookmarks();
            } else {
                currentUser = null;
                savedArticleIds = [];
            }
        } catch (e) {
            console.error("Failed to fetch initial Supabase session:", e);
            currentUser = null;
            savedArticleIds = [];
        }
        
        // Listen to auth state changes
        try {
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (session && session.user) {
                    currentUser = {
                        id: session.user.id,
                        email: session.user.email,
                        username: session.user.user_metadata?.username || session.user.email.split("@")[0]
                    };
                    const role = getUserRole(currentUser.email);
                    currentUser.role = role;
                    currentUser.isAdmin = (role === "admin");
                    currentUser.isEditor = (role === "admin" || role === "editor");
                    loadBookmarks();
                } else {
                    currentUser = null;
                    savedArticleIds = [];
                }
                updateAuthUI();
                
                // Refresh categories grid view if user logged out while viewing bookmarks
                if (currentCategoryFilter === "bookmarks" && !currentUser) {
                    filterCategory("all");
                }
            });
        } catch (e) {
            console.error("Failed to bind Supabase onAuthStateChange listener:", e);
        }
    } else {
        // Offline Mock Auth Initialization
        try {
            const localSession = localStorage.getItem("murekkep_mock_session");
            if (localSession) {
                currentUser = JSON.parse(localSession);
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                loadBookmarks();
            } else {
                currentUser = null;
                savedArticleIds = [];
            }
        } catch (e) {
            currentUser = null;
            savedArticleIds = [];
        }
    }
    updateAuthUI();
}

// User Actions
async function signUpUser(email, password, username) {
    if (email.toLowerCase() === "admin@murekkep.com" || email.toLowerCase() === "editor@murekkep.com") {
        showToast("❌ Bu e-posta adresiyle yeni kayıt oluşturulamaz.");
        return;
    }
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });
            if (error) throw error;
            
            if (data.user) {
                // Register user in our public database list
                registerUserInList(data.user.email, username || data.user.user_metadata?.username || data.user.email.split("@")[0]).catch(console.error);

                // If session exists directly (email confirmation disabled)
                if (data.session) {
                    currentUser = {
                        id: data.user.id,
                        email: data.user.email,
                        username: username
                    };
                    loadBookmarks();
                    updateAuthUI();
                    closeAuthModal();
                    showToast("Aramıza hoş geldiniz, " + username + "! 🎉");
                } else {
                    // Email confirmation is enabled - try to auto sign in anyway
                    // (works if user already exists or confirmation is disabled)
                    const { data: signInData, error: signInErr } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
                    
                    if (!signInErr && signInData?.user) {
                        currentUser = {
                            id: signInData.user.id,
                            email: signInData.user.email,
                            username: username
                        };
                        loadBookmarks();
                        updateAuthUI();
                        closeAuthModal();
                        showToast("Aramıza hoş geldiniz, " + username + "! 🎉");
                    } else {
                        // Truly needs email confirmation
                        showToast("✉️ Kayıt başarılı! " + email + " adresine onay maili gönderildi.");
                        switchAuthTab('login');
                        document.getElementById("login-email").value = email;
                    }
                }
            }
        } catch (err) {
            console.error("Sign up error:", err);
            // User-friendly Turkish error messages
            let msg = "Kayıt hatası oluştu.";
            if (err.message.includes("already registered") || err.message.includes("already been registered")) {
                msg = "Bu e-posta adresi zaten kayıtlı! Giriş yapmayı deneyin.";
            } else if (err.message.includes("Password should be") || err.message.includes("password")) {
                msg = "Şifre en az 6 karakter olmalıdır.";
            } else if (err.message.includes("Invalid email")) {
                msg = "Geçersiz e-posta adresi.";
            } else if (err.message) {
                msg = err.message;
            }
            showToast("❌ " + msg);
        }
    } else {
        // Offline Mock Sign Up
        try {
            const users = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            if (users.some(u => u.email === email)) {
                showToast("Bu e-posta adresi zaten kayıtlı!");
                return;
            }
            const newUser = { id: "u_" + Date.now(), email, password, username };
            users.push(newUser);
            localStorage.setItem("murekkep_mock_users", JSON.stringify(users));
            showToast("Kayıt başarılı! Giriş yapabilirsiniz.");
            switchAuthTab('login');
            document.getElementById("login-email").value = email;
        } catch (e) {
            showToast("Kayıt sırasında hata oluştu.");
        }
    }
}

async function signInUser(email, password) {
    const emailNorm = (email || "").toLowerCase().trim();
    const passNorm = (password || "").toLowerCase().trim();

    // Pre-defined Admin login intercept for testing and moderation
    if ((emailNorm === "admin@murekkep.com" || emailNorm === "admin") && 
        (passNorm === "murekkepadmin" || passNorm === "admin" || passNorm === "murekkep")) {
        const role = "admin";
        currentUser = {
            id: "admin_murekkep",
            email: "admin@murekkep.com",
            username: "Mürekkep Yöneticisi",
            role: role,
            isAdmin: true,
            isEditor: true
        };
        localStorage.setItem("murekkep_mock_session", JSON.stringify(currentUser));
        loadBookmarks();
        updateAuthUI();
        closeAuthModal();
        showToast("👋 Yönetici olarak giriş yapıldı. Editör Modu aktif edilebilir.");
        return;
    }

    // Pre-defined Editor login intercept
    if ((emailNorm === "editor@murekkep.com" || emailNorm === "editor") && 
        (passNorm === "murekkepeditor" || passNorm === "mürekkepeditör" || passNorm === "editor" || passNorm === "editör" || passNorm === "murekkep")) {
        const role = "editor";
        currentUser = {
            id: "editor_murekkep",
            email: "editor@murekkep.com",
            username: "Mürekkep Editörü",
            role: role,
            isAdmin: false,
            isEditor: true
        };
        localStorage.setItem("murekkep_mock_session", JSON.stringify(currentUser));
        loadBookmarks();
        updateAuthUI();
        closeAuthModal();
        showToast("👋 Editör olarak giriş yapıldı. Editör Modu aktif edilebilir.");
        return;
    }

    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) throw error;
            
            if (data.user) {
                currentUser = {
                    id: data.user.id,
                    email: data.user.email,
                    username: data.user.user_metadata?.username || data.user.email.split("@")[0]
                };
                registerUserInList(currentUser.email, currentUser.username).catch(console.error);
                
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                
                loadBookmarks();
                updateAuthUI();
                closeAuthModal();
                showToast("👋 Hoş geldiniz, " + currentUser.username + "!");
            }
        } catch (err) {
            console.error("Sign in error:", err);
            // User-friendly Turkish error messages
            let msg = "Giriş hatası oluştu.";
            if (err.message.includes("Invalid login") || err.message.includes("invalid_credentials") || err.message.includes("Email not confirmed")) {
                msg = "E-posta veya şifre hatalı. Lütfen tekrar deneyin.";
            } else if (err.message.includes("Email not confirmed")) {
                msg = "E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.";
            } else if (err.message) {
                msg = err.message;
            }
            showToast("❌ " + msg);
        }
    } else {
        // Offline Mock Sign In
        try {
            const users = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                currentUser = {
                    id: user.id,
                    email: user.email,
                    username: user.username
                };
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                
                localStorage.setItem("murekkep_mock_session", JSON.stringify(currentUser));
                loadBookmarks();
                updateAuthUI();
                closeAuthModal();
                showToast("Giriş başarılı! (Çevrimdışı)");
            } else {
                showToast("E-posta veya şifre hatalı!");
            }
        } catch (e) {
            showToast("Giriş hatası.");
        }
    }
}

async function signOutUser() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
        } catch (err) {
            console.error("Sign out error:", err);
        }
    }
    // Clear mock session
    localStorage.removeItem("murekkep_mock_session");
    currentUser = null;
    savedArticleIds = [];
    updateAuthUI();
    
    // Refresh page / view
    if (currentCategoryFilter === "bookmarks") {
        filterCategory("all");
    } else {
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }
    
    showToast("Çıkış yapıldı.");
}

async function sendPasswordReset(email) {
    if (!email || !email.includes('@')) {
        showToast("❌ Lütfen geçerli bir e-posta adresi girin.");
        return;
    }
    if (!isSupabaseConnected || !supabaseClient) {
        showToast("❌ Şifre sıfırlama için internet bağlantısı gereklidir.");
        return;
    }
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        showToast("✉️ Sıfırlama bağlantısı gönderildi! Lütfen e-posta kutunuzu kontrol edin.");
        // Switch back to login tab
        const resetForm = document.getElementById('reset-form');
        const loginForm = document.getElementById('login-form');
        if (resetForm) resetForm.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('hidden');
    } catch (err) {
        console.error("Password reset error:", err);
        let msg = err.message || "Sıfırlama e-postası gönderilemedi.";
        if (err.message && err.message.includes('rate limit')) msg = "Lütfen birkaç dakika bekleyip tekrar deneyin.";
        showToast("❌ " + msg);
    }
}

// Handle returning from password reset link
function handlePasswordRecovery() {
    if (!isSupabaseConnected || !supabaseClient) return;
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            // Show password update modal
            const newPass = prompt('İstenilen yeni şifrenizi girin (en az 6 karakter):');
            if (!newPass || newPass.length < 6) {
                showToast('❌ Şifre en az 6 karakter olmalıdır.');
                return;
            }
            const { error } = await supabaseClient.auth.updateUser({ password: newPass });
            if (error) {
                showToast('❌ Şifre güncellenemedi: ' + error.message);
            } else {
                showToast('✅ Şifreniz başarıyla güncellendi! Tekrar giriş yapabilirsiniz.');
                await supabaseClient.auth.signOut();
                updateAuthUI();
            }
        }
    });
}


function initSupabase() {
    const url = SUPABASE_URL || localStorage.getItem("murekkep_supabase_url");
    const key = SUPABASE_ANON_KEY || localStorage.getItem("murekkep_supabase_key");

    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key);
            isSupabaseConnected = true;
            console.log("Supabase connection initialized successfully.");
        } catch (err) {
            console.error("Failed to initialize Supabase client:", err);
            isSupabaseConnected = false;
        }
    } else {
        isSupabaseConnected = false;
        console.warn("Supabase credentials not found. Falling back to LocalStorage.");
    }
    updateSupabaseUI();
}

async function seedSupabase() {
    try {
        // Insert all default articles
        const articlesToInsert = DEFAULT_ARTICLES.map(art => ({
            id: art.id,
            title: art.title,
            subtitle: art.subtitle,
            author: art.author,
            category: art.category,
            image: art.image,
            date: art.date,
            read_time: art.readTime,
            claps: art.claps,
            content: art.content
        }));

        const { error: artError } = await supabaseClient
            .from('articles')
            .insert(articlesToInsert);

        if (artError) throw artError;

        // Insert all default comments
        const commentsToInsert = DEFAULT_COMMENTS.map(c => ({
            id: c.id,
            article_id: c.articleId,
            author: c.author,
            text: c.text,
            date: c.date
        }));

        const { error: commError } = await supabaseClient
            .from('comments')
            .insert(commentsToInsert);

        if (commError) throw commError;

        console.log("Supabase seeding completed successfully.");
    } catch (err) {
        console.error("Error seeding Supabase:", err);
    }
}

let isSeeding = false;
async function loadData() {
    if (isSupabaseConnected) {
        // Try to load from cache first
        try {
            const cachedDataStr = localStorage.getItem(CACHE_KEY);
            if (cachedDataStr) {
                const cache = JSON.parse(cachedDataStr);
                const age = Date.now() - cache.timestamp;
                if (age < CACHE_TTL) {
                    articles = cache.articles;
                    comments = cache.comments;
                    console.log(`Loaded ${articles.length} articles and ${comments.length} comments from Local Cache (Age: ${Math.round(age/1000)}s).`);
                    
                    // Refresh view
                    currentPage = 1;
                    if (currentCategoryFilter === "all") {
                        renderNewspaperGrid();
                    } else {
                        renderCategoryFeed(currentCategoryFilter);
                    }
                    return; // Cache hit, exit!
                }
            }
        } catch (e) {
            console.warn("Failed to read Supabase cache from LocalStorage:", e);
        }

        try {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Supabase request timeout")), 3000)
            );

            // Fetch articles metadata with timeout (excluding full content to save bandwidth/costs)
            const fetchArticlesPromise = supabaseClient
                .from('articles')
                .select('id, title, subtitle, author, category, image, date, read_time, claps')
                .order('created_at', { ascending: true });

            const { data: dbArticles, error: artError } = await Promise.race([
                fetchArticlesPromise, 
                timeoutPromise
            ]);
            
            if (artError) throw artError;

            // If database is empty, only seed if explicitly requested via query parameter
            if (!dbArticles || dbArticles.length === 0) {
                if (window.location.search.includes("seed_db=true")) {
                    if (!isSeeding) {
                        isSeeding = true;
                        console.log("Supabase articles table is empty, seeding database...");
                        await seedSupabase();
                        isSeeding = false;
                        window.location.href = window.location.pathname;
                        return;
                    }
                }
                articles = [];
                comments = [];
            } else {
                // Fetch comments with timeout
                const fetchCommentsPromise = supabaseClient
                    .from('comments')
                    .select('*');

                const { data: dbComments, error: commError } = await Promise.race([
                    fetchCommentsPromise, 
                    timeoutPromise
                ]);

                if (commError) throw commError;

                // Map data to frontend variables
                articles = dbArticles.map(art => ({
                    id: art.id,
                    title: art.title,
                    subtitle: art.subtitle,
                    author: art.author,
                    category: art.category,
                    image: art.image,
                    date: art.date,
                    readTime: art.read_time,
                    claps: art.claps,
                    content: null // Load content on demand!
                }));

                comments = dbComments.map(c => ({
                    id: c.id,
                    articleId: c.article_id,
                    author: c.author,
                    text: c.text,
                    date: c.date
                }));
                
                // Write to cache
                try {
                    const cachePayload = {
                        timestamp: Date.now(),
                        articles: articles,
                        comments: comments
                    };
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
                    console.log("Saved database results to local cache.");
                } catch (e) {
                    console.warn("Failed to write Supabase cache to LocalStorage:", e);
                }

                console.log(`Loaded ${articles.length} articles and ${comments.length} comments from Supabase.`);
            }
        } catch (err) {
            console.error("Error loading data from Supabase. Falling back to local storage:", err);
            isSupabaseConnected = false;
            updateSupabaseUI();
            loadLocalStorageFallback();
        }
    } else {
        loadLocalStorageFallback();
    }

    // Refresh the newspaper view and pagination
    currentPage = 1;
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
}

function loadLocalStorageFallback() {
    try {
        const savedArticles = localStorage.getItem("murekkep_articles_v2");
        if (savedArticles) {
            articles = JSON.parse(savedArticles);
            let updated = false;
            DEFAULT_ARTICLES.forEach(def => {
                const idx = articles.findIndex(a => a.id === def.id);
                if (idx === -1) {
                    articles.push(def);
                    updated = true;
                } else {
                    let repaired = false;
                    for (const key in def) {
                        if (articles[idx][key] === undefined || articles[idx][key] === null || articles[idx][key] === "undefined") {
                            articles[idx][key] = def[key];
                            repaired = true;
                        }
                    }
                    if (repaired) updated = true;
                }
            });
            if (updated) {
                localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
            }
        } else {
            articles = DEFAULT_ARTICLES;
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(DEFAULT_ARTICLES));
        }
    } catch (e) {
        articles = DEFAULT_ARTICLES;
    }

    try {
        comments = [];
        localStorage.setItem("murekkep_comments_v2", JSON.stringify([]));
    } catch (e) {
        comments = [];
    }
}

// DOM Elements
const mainGrid = document.getElementById("newspaper-main-grid");
const themeToggleBtn = document.getElementById("theme-toggle");
const writeToggleBtn = document.getElementById("write-toggle");
const editorOverlay = document.getElementById("editor-overlay");
const closeEditorBtn = document.getElementById("close-editor");
const publishForm = document.getElementById("publish-form");
const readingOverlay = document.getElementById("reading-overlay");
const closeReadingBtn = document.getElementById("close-reading");
const readingProgress = document.getElementById("reading-progress");

// Article Detail DOM
const detailCategory = document.getElementById("article-detail-category");
const detailTitle = document.getElementById("article-detail-title");
const detailSubtitle = document.getElementById("article-detail-subtitle");
const detailAuthor = document.getElementById("article-detail-author");
const detailAvatarContainer = document.getElementById("article-detail-avatar-container");
const detailDate = document.getElementById("article-detail-date");
const detailReadtime = document.getElementById("article-detail-readtime");
const detailClapCount = document.getElementById("article-clap-count");
const detailClapBtn = document.getElementById("article-clap-btn");
const detailImage = document.getElementById("article-detail-image");
const detailContent = document.getElementById("article-detail-content");
const commentForm = document.getElementById("comment-form");
const commentAuthorInput = document.getElementById("comment-author-input");
const commentTextInput = document.getElementById("comment-text-input");
const commentsListContainer = document.getElementById("comments-list-container");
const commentsTotalCountEl = document.getElementById("comments-total-count");
const commentsDrawer = document.getElementById("comments-drawer");
const commentsDrawerBackdrop = document.getElementById("comments-drawer-backdrop");
const closeCommentsDrawerBtn = document.getElementById("close-comments-drawer");
const commentsTriggerBar = document.getElementById("comments-trigger-bar");
const articleCommentBtn = document.getElementById("article-comment-btn");
const articleEditorEditBtn = document.getElementById("article-editor-edit-btn");
let editingArticleId = null;

// Auth DOM Elements
const authOverlay = document.getElementById("auth-overlay");
const closeAuthBtn = document.getElementById("close-auth");
const loginToggleBtn = document.getElementById("login-toggle");
const logoutBtn = document.getElementById("logout-btn");
const userProfileSection = document.getElementById("user-profile-section");
const userDisplayName = document.getElementById("user-display-name");
const userAvatarCircle = document.getElementById("user-avatar-circle");
const profileAvatarBtn = document.getElementById("profile-avatar-btn");
const profileDropdownMenu = document.getElementById("profile-dropdown-menu");
const dropdownAvatarLarge = document.getElementById("dropdown-avatar-large");
const dropdownUserName = document.getElementById("dropdown-user-name");
const dropdownUserEmail = document.getElementById("dropdown-user-email");
const dropdownBookmarksBtn = document.getElementById("dropdown-bookmarks-btn");
const dropdownSettingsBtn = document.getElementById("dropdown-settings-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const bookmarksTab = document.getElementById("bookmarks-tab");
const articleSaveBtn = document.getElementById("article-save-btn");

// Profile dropdown open/close
function toggleProfileDropdown(forceClose = false) {
    if (!profileDropdownMenu || !profileAvatarBtn) return;
    const isOpen = !profileDropdownMenu.classList.contains("hidden");
    if (forceClose || isOpen) {
        profileDropdownMenu.classList.add("hidden");
        profileAvatarBtn.setAttribute("aria-expanded", "false");
    } else {
        profileDropdownMenu.classList.remove("hidden");
        profileAvatarBtn.setAttribute("aria-expanded", "true");
        
        // Close notifications dropdown if open
        const notifMenu = document.getElementById("notifications-dropdown-menu");
        if (notifMenu) notifMenu.classList.add("hidden");
        const notifBtn = document.getElementById("notifications-btn");
        if (notifBtn) notifBtn.setAttribute("aria-expanded", "false");
    }
}


// Current active article ID inside modal
let activeArticleId = null;
let currentCategoryFilter = "all";
let currentPage = 1;
// Shared state for sequential slot filling
let _slotArticleIdx = 0;
let _pageArticles = [];

// Function to sort articles by claps descending
function getSortedArticles() {
    return articles.slice().sort((a, b) => b.claps - a.claps);
}

// Visitor and Page statistics tracking
async function trackPageVisit(pageName, articleId = null, category = null) {
    try {
        // 1. Unique Visitor Check
        let visitorUuid = localStorage.getItem("murekkep_visitor_uuid");
        let isAbsoluteUnique = false;
        if (!visitorUuid) {
            visitorUuid = 'visitor_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("murekkep_visitor_uuid", visitorUuid);
            isAbsoluteUnique = true;
        }

        const today = new Date().toISOString().split('T')[0];
        let lastVisitDate = localStorage.getItem("murekkep_last_visit_date");
        let isDailyUnique = false;
        if (lastVisitDate !== today) {
            localStorage.setItem("murekkep_last_visit_date", today);
            isDailyUnique = true;
        }

        // 2. Detect Device
        const ua = navigator.userAgent;
        let device = "desktop";
        if (/Mobi|Android|iPhone|iPad|Windows Phone/i.test(ua)) {
            if (/iPad|tablet/i.test(ua)) {
                device = "tablet";
            } else {
                device = "mobile";
            }
        }

        // 3. Detect Browser
        let browser = "other";
        if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) {
            browser = "chrome";
        } else if (/firefox|iceweasel/i.test(ua)) {
            browser = "firefox";
        } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
            browser = "safari";
        } else if (/edge|edg/i.test(ua)) {
            browser = "edge";
        }



        // 5. Load existing statistics
        let stats = null;
        if (isSupabaseConnected && supabaseClient) {
            try {
                const { data } = await supabaseClient
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'site_statistics')
                    .single();
                if (data && data.value) {
                    stats = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                }
            } catch (e) {
                console.warn("Failed to load stats from Supabase:", e);
            }
        }

        if (!stats) {
            try {
                const saved = localStorage.getItem("murekkep_site_statistics");
                if (saved) stats = JSON.parse(saved);
            } catch (e) {}
        }

        // Initialize default stats if not exists
        if (!stats || typeof stats !== 'object') {
            stats = {
                totalPageViews: 0,
                totalUniqueVisitors: 0,
                categoryViews: {
                    manset: 0, siir: 0, oyku: 0, deneme: 0, kitap: 0, roportaj: 0, "kose-yazilari": 0, haber: 0, yarismalar: 0
                },
                articleViews: {},
                deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
                browserStats: { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 },
                dailyStats: {},
                recentVisits: []
            };
        }

        // 6. Update Stats Counters
        stats.totalPageViews = (stats.totalPageViews || 0) + 1;
        if (isAbsoluteUnique) {
            stats.totalUniqueVisitors = (stats.totalUniqueVisitors || 0) + 1;
        }

        // Update Device & Browser
        if (!stats.deviceStats) stats.deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
        stats.deviceStats[device] = (stats.deviceStats[device] || 0) + 1;

        if (!stats.browserStats) stats.browserStats = { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 };
        stats.browserStats[browser] = (stats.browserStats[browser] || 0) + 1;

        // Category & Article views if specified
        if (category) {
            if (!stats.categoryViews) stats.categoryViews = {};
            stats.categoryViews[category] = (stats.categoryViews[category] || 0) + 1;
        }
        if (articleId) {
            if (!stats.articleViews) stats.articleViews = {};
            stats.articleViews[articleId] = (stats.articleViews[articleId] || 0) + 1;
        }

        // Update Daily stats
        if (!stats.dailyStats) stats.dailyStats = {};
        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = { pageViews: 0, uniqueVisitors: 0 };
        }
        stats.dailyStats[today].pageViews = (stats.dailyStats[today].pageViews || 0) + 1;
        if (isDailyUnique) {
            stats.dailyStats[today].uniqueVisitors = (stats.dailyStats[today].uniqueVisitors || 0) + 1;
        }

        // Clean up old daily stats (keep last 30 days)
        const dailyKeys = Object.keys(stats.dailyStats).sort();
        if (dailyKeys.length > 30) {
            for (let i = 0; i < dailyKeys.length - 30; i++) {
                delete stats.dailyStats[dailyKeys[i]];
            }
        }

        // Update Recent Visits Log
        if (!stats.recentVisits) stats.recentVisits = [];
        stats.recentVisits.unshift({
            timestamp: new Date().toISOString(),
            page: pageName,
            device: device,
            browser: browser
        });

        // Keep last 50 visits only
        if (stats.recentVisits.length > 50) {
            stats.recentVisits = stats.recentVisits.slice(0, 50);
        }

        // 7. Save Stats
        localStorage.setItem("murekkep_site_statistics", JSON.stringify(stats));

        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient
                    .from('site_settings')
                    .upsert({ key: 'site_statistics', value: stats });
            } catch (e) {
                console.error("Failed to save stats to Supabase:", e);
            }
        }
    } catch (e) {
        console.error("Error tracking statistics:", e);
    }
}

// Functions

// Helper to truncate text to prevent cards from overflowing in the grid
function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

// Calculate Read Time
function calculateReadTime(text) {
    const wordsPerMinute = 200;
    const cleanText = text.replace(/<[^>]*>/g, ""); // strip HTML
    const wordCount = cleanText.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} dk okuma`;
}

// Generate unique ID
function generateId() {
    return 'art_' + Math.random().toString(36).substr(2, 9);
}

// Format Date
function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
}

// Get latest article for a category slot
function getLatestByCategory(cat) {
    const filtered = articles.filter(a => a.category === cat);
    return filtered[filtered.length - 1] || null;
}

// Helper to render dynamic card styles or beautiful placeholder calls
function renderSlotCard(art, slotIndex, styleType, defaultCategoryLabel, pageLabel) {
    if (!art) {
        // Render a beautiful print-style placeholder for empty slot
        return `
            <div class="article-card empty-slot-placeholder" style="border: 1px dashed var(--border-light); padding: 25px; text-align: center; border-radius: 8px; background-color: var(--bg-secondary); margin-bottom: 20px;">
                <span class="card-category" style="color: var(--text-secondary); opacity: 0.7;">BOŞ SÜTUN</span>
                <h4 style="font-family: var(--font-header); font-size: 1.15rem; margin: 15px 0 10px; color: var(--text-secondary);">Yeni Kalemler Aranıyor</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 15px;">Bu sütun boş kalmıştır. Edebiyat hareketine katılmak için hemen bir yazı kaleme alın!</p>
                <button onclick="document.getElementById('write-toggle').click()" style="background-color: transparent; border: 1px solid var(--border-color); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.75rem; font-weight: 700; padding: 6px 12px; border-radius: 15px; cursor: pointer; text-transform: uppercase;">Yazı Ekle</button>
            </div>
        `;
    }

    // Moderation check
    const reports = getArticleReports(art.id);
    if (reports >= 3 && !isEditorModeActive) {
        return `
            <div class="moderated-content-placeholder" style="margin-bottom: 20px;">
                <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: var(--accent-color); margin-bottom: 8px; display: inline-block;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <h4 style="font-family: var(--font-header); font-size: 1rem; margin-bottom: 4px; color: var(--text-primary);">Sütun İncelemede</h4>
                <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; max-width: 300px; margin: 0 auto;">Bu içerik okur şikayetleri sebebiyle geçici olarak editör incelemesine alınmıştır.</p>
            </div>
        `;
    }

    const image = art.image && art.image !== "undefined" ? art.image : "assets/typewriter_birds.webp";
    const subtitle = art.subtitle && art.subtitle !== "undefined" ? art.subtitle : "";
    const author = art.author && art.author !== "undefined" ? art.author : "Mürekkep Yazarı";
    const rankBadge = getAuthorRankBadgeHtml(author);
    const followersVal = getAuthorFollowerCount(author);
    const followersBadge = `<span style="font-size: 0.68rem; font-weight: normal; color: var(--text-secondary); opacity: 0.75; margin-left: 5px; display: inline-flex; align-items: center; gap: 2px;" title="${author} yazarının takipçi sayısı">👥 ${followersVal}</span>`;
    const authorHtml = `<span onclick="event.stopPropagation(); window.openAuthorProfile('${author.replace(/'/g, "\\'")}')" style="cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s; display: inline-flex; align-items: center; gap: 2px; flex-wrap: wrap;" onmouseover="this.style.color='var(--accent-color)'" onmouseout="this.style.color=''" title="Yazar Künyesini Göster">${author}${rankBadge}</span>${followersBadge}`;
    const cleanCatName = (art.category || "").trim().toLowerCase();
    const catMap = {
        "siir": "ŞİİR",
        "oyku": "ÖYKÜ",
        "deneme": "DENEME",
        "kitap": "KİTAP İNCELEMESİ",
        "roportaj": "YAZAR RÖPORTAJI",
        "kose-yazilari": "KÖŞE YAZISI",
        "haber": "EDEBİYAT HABERLERİ",
        "yarismalar": "YARIŞMA"
    };
    const categoryLabel = art.corner_name ? art.corner_name.toUpperCase() : "";

    let cardHTML = "";

    if (styleType === 'headline') {
        const displayLead = truncateText(subtitle, 200);
        cardHTML = `
            <article class="article-card headline-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                <h2 class="card-title" style="font-family: var(--font-header); font-size: 2rem; font-weight: 900; line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 8px; text-align: center;">${art.title}</h2>
                <p class="card-lead" style="font-family: var(--font-body); font-size: 0.95rem; line-height: 1.45; text-align: center; color: var(--text-secondary); margin-bottom: 15px; max-width: 90%; margin-left: auto; margin-right: auto;">${displayLead}</p>
                <div class="card-image-box" style="width: 100%; height: 260px; overflow: hidden; border: 1px solid var(--border-light); border-radius: 4px; margin-bottom: 10px;">
                    <img src="${image}" alt="${art.title}" class="card-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                </div>
            </article>
        `;
    } else {
        const displaySubtitle = truncateText(subtitle, 140);

        if (styleType === 'siir' || art.category === 'siir') {
            // Render as poem style
            const poemLines = art.content ? art.content.replace(/<[^>]*>/g, "").split("\n").slice(0, 5).join("\n") : subtitle;
            const poemImage = art.image && art.image !== "undefined" ? art.image : "assets/poetry_flowers.webp";
            cardHTML = `
                <article class="article-card poem-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.35rem; font-weight: 900; margin: 6px 0 2px 0;">${art.title}</h3>
                    <span class="card-author" style="font-family: var(--font-ui); font-size: 0.75rem; color: var(--text-secondary); display: block; margin-bottom: 12px; font-weight: 500;">${authorHtml}</span>
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; width: 100%;">
                        <div class="poem-excerpt" style="font-family: var(--font-body); font-size: 0.85rem; line-height: 1.45; font-style: italic; color: var(--text-primary); flex: 1;">${poemLines}</div>
                        <div class="card-image-box" style="width: 100px; height: 110px; flex-shrink: 0; border: none; margin: 0; padding: 0;">
                            <img src="${poemImage}" alt="Edebi Görsel" class="card-image" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.onerror=null;this.src='assets/poetry_flowers.webp';">
                        </div>
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; margin-top: 10px; display: block; text-align: left;">► OKU</span>
                </article>
            `;
        } else if (styleType === 'roportaj' || art.category === 'roportaj') {
            // Render as horizontal card style
            const roportajImage = art.image && art.image !== "undefined" ? art.image : "assets/author_zeynep.webp";
            cardHTML = `
                <article class="article-card article-card-horizontal" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.25rem; font-weight: 900; margin: 6px 0 12px 0;">${art.title}</h3>
                    <div style="display: flex; gap: 12px; align-items: flex-start; width: 100%;">
                        <div class="card-image-box" style="width: 80px; height: 90px; flex-shrink: 0; border: 1px solid var(--border-light); margin: 0;">
                            <img src="${roportajImage}" alt="${art.title}" class="card-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                        </div>
                        <div class="card-text" style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
                            <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; margin: 0 0 6px 0;">${displaySubtitle}</p>
                            <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; display: block;">► OKU</span>
                        </div>
                    </div>
                </article>
            `;
        } else if (styleType === 'kose' || art.category === 'kose-yazilari') {
            // Render as columnist card style
            const koseImage = art.image && art.image !== "undefined" ? art.image : "assets/author_mehmet.webp";
            cardHTML = `
                <article class="article-card columnist-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.15rem; font-weight: 900; margin: 6px 0 2px 0;">${art.title}</h3>
                    <span class="card-author" style="font-family: var(--font-ui); font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 10px; font-weight: 500;">${authorHtml}</span>
                    <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
                        <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; flex: 1; margin: 0;">${displaySubtitle}</p>
                        <div class="columnist-avatar-box" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 1px solid var(--border-light); flex-shrink: 0; margin: 0;">
                            <img src="${koseImage}" alt="${author}" class="columnist-avatar" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; margin-top: 8px; display: block;">► OKU</span>
                </article>
            `;
        } else if (styleType === 'haber' || art.category === 'haber') {
            // Render as news item list card
            const newsArticles = articles.filter(a => a.category === 'haber').slice(0, 3);
            let newsItemsHTML = "";
            if (newsArticles.length > 0) {
                newsArticles.forEach(na => {
                    newsItemsHTML += `<div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 8px; border-bottom: 1px dotted var(--border-light); padding-bottom: 6px; cursor: pointer;" onclick="openArticle('${na.id}')">• ${na.title}</div>`;
                });
            } else {
                newsItemsHTML = `
                    <div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 6px;">• İstanbul Kitap Fuarı Kapılarını Açtı</div>
                    <div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 6px;">• 2024 Cevdet Kudret Edebiyat Ödülleri Sahiplerini Buldu</div>
                    <div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 6px;">• Genç Yazarlar İçin Yeni Fon Desteği</div>
                `;
            }
            cardHTML = `
                <article class="article-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <div class="news-list" style="margin-top: 10px; margin-bottom: 10px;">
                        ${newsItemsHTML}
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; display: block;">► OKU</span>
                </article>
            `;
        } else if (styleType === 'yarisma' || art.category === 'yarismalar') {
            // Render as contest card style
            cardHTML = `
                <article class="article-card contest-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.15rem; font-weight: 900; margin: 6px 0 6px 0;">${art.title}</h3>
                    <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
                        <div style="flex: 1;">
                            <div class="contest-theme" style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--accent-color); letter-spacing: 0.5px; margin-bottom: 4px;">Tema: "Serbest Edebi Eser"</div>
                            <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; margin: 0;">${displaySubtitle}</p>
                        </div>
                        <svg class="contest-icon" viewBox="0 0 24 24" style="width: 45px; height: 45px; fill: var(--text-secondary); opacity: 0.6; flex-shrink: 0;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; margin-top: 8px; display: block;">► OKU</span>
                </article>
            `;
        } else {
            // Default standard card
            const isKitap = art.category === 'kitap';
            cardHTML = `
                <article class="article-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.25rem; font-weight: 900; margin: 6px 0 4px 0;">${art.title}</h3>
                    <span class="card-author" style="font-family: var(--font-ui); font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 10px; font-weight: 500;">${authorHtml}</span>
                    <div class="card-image-box" style="width: 100%; height: ${isKitap ? '160px' : '110px'}; overflow: hidden; border: 1px solid var(--border-light); margin-bottom: 10px; border-radius: 4px;">
                        <img src="${image}" alt="${art.title}" class="card-image" style="width: 100%; height: 100%; object-fit: ${isKitap ? 'contain' : 'cover'}; background-color: ${isKitap ? 'var(--bg-secondary)' : 'transparent'};" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                    </div>
                    <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; margin-bottom: 8px;">${displaySubtitle}</p>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; display: block;">► OKU</span>
                </article>
            `;
        }
    }

    // Inject editor controls if Editor Mode is active
    if (isEditorModeActive) {
        const isFlagged = reports > 0;
        if (isFlagged) {
            cardHTML = cardHTML.replace('class="article-card', 'class="article-card flagged');
            const badgeHTML = `<div class="flag-badge">⚠️ Şikayet: ${reports}</div>`;
            cardHTML = cardHTML.replace(/<article[^>]*>/, match => `${match}\n${badgeHTML}`);
        }
        const controlsHTML = `
            <div class="editor-card-controls" onclick="event.stopPropagation();">
                <button class="btn-editor-action approve" onclick="window.approveArticleClick('${art.id}', event)">Onayla</button>
                <button class="btn-editor-action delete" onclick="window.deleteArticleClick('${art.id}', event)">Kaldır</button>
            </div>
        `;
        cardHTML = cardHTML.replace('</article>', `${controlsHTML}\n</article>`);
    }

    return cardHTML;
}

// Function to handle page flips
function changePage(page) {
    currentPage = page;
    
    // Add flip transition animation to main grid
    mainGrid.classList.add("page-fade-transition");
    
    // Smooth scroll back to top of the newspaper
    document.querySelector(".newspaper-header").scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        renderNewspaperGrid();
        mainGrid.classList.remove("page-fade-transition");
    }, 300);
}

// RENDER NEWSPAPER FRONT-PAGE GRID
function renderNewspaperGrid() {
    mainGrid.className = "newspaper-grid"; // ensure grid class is set

    const sorted = getSortedArticles();

    // PAGE CAPACITY = total number of category-type slots across all columns
    const allLayoutSlots = [
        ...(layoutConfig.col1 || []),
        ...(layoutConfig.col2 || []),
        ...(layoutConfig.col3 || [])
    ];
    const categorySlotCount = Math.max(1, allLayoutSlots.filter(s => s.type === 'category').length);
    const headlineSlotCount = allLayoutSlots.filter(s => s.type === 'system' && s.value === 'headline').length;
    const pageCapacity = categorySlotCount + headlineSlotCount;

    // Pages: only open page 2 when page 1 is completely full
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageCapacity));

    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }

    // Slice articles for this page (sequential, clap-sorted)
    const pageStartIdx = (currentPage - 1) * pageCapacity;
    
    // One headline per page = first article of each page's pool
    const headlines = [];
    for (let p = 0; p < totalPages; p++) {
        const first = sorted[p * pageCapacity];
        if (first) headlines.push(first);
    }
    const slotHeadline = headlines[currentPage - 1];

    const rawPageArticles = sorted.slice(pageStartIdx, pageStartIdx + pageCapacity);
    // Filter out the headline article of this page so it is not duplicated in category slots
    _pageArticles = rawPageArticles.filter(art => !slotHeadline || art.id !== slotHeadline.id);
    if (_pageArticles.length > categorySlotCount) {
        _pageArticles = _pageArticles.slice(0, categorySlotCount);
    }
    _slotArticleIdx = 0; // reset slot index before rendering

    // Update Header page label
    const pageIndicator = document.getElementById("header-page-indicator");
    if (pageIndicator) {
        pageIndicator.innerText = `SAYI: 01 / SAYFA: ${String(currentPage).padStart(2, '0')}`;
    }

    // Gather global comments for the "Okur Yorumları" section
    const recentComments = comments.slice(-3).reverse();


    // Determine dynamic column widths for CSS Grid columns
    const colWidths = layoutConfig.colWidths || { col1: 1, col2: 2, col3: 1 };
    
    const col1Slots = layoutConfig.col1 || [];
    const col2Slots = layoutConfig.col2 || [];
    const col3Slots = layoutConfig.col3 || [];

    const col1MaxSlotW = Math.max(1, ...col1Slots.map(s => s.slotWidth || 1));
    const col2MaxSlotW = Math.max(1, ...col2Slots.map(s => s.slotWidth || 1));
    const col3MaxSlotW = Math.max(1, ...col3Slots.map(s => s.slotWidth || 1));

    const col1W = Math.max(colWidths.col1 || 1, col1MaxSlotW);
    const col2W = Math.max(colWidths.col2 || 1, col2MaxSlotW);
    const col3W = Math.max(colWidths.col3 || 1, col3MaxSlotW);

    // Apply column template dynamically based on colWidths
    mainGrid.style.gridTemplateColumns = `${col1W}fr ${col2W}fr ${col3W}fr`;

    let col1HTML = "";
    let col2HTML = "";
    let col3HTML = "";

    // Render columns dynamically from layoutConfig
    if (layoutConfig.col1) {
        layoutConfig.col1.forEach((slot, index) => {
            let slotHTML = renderSlotHelper(slot, index, sorted, headlines, recentComments);
            if (!slotHTML) return;
            if (isEditorModeActive) {
                slotHTML = wrapSlotInEditorControls(slot, index, 'col1', slotHTML, col1W);
            } else {
                const sz = slot.size || 'normal';
                const sw = slot.slotWidth || 1;
                const sh = slot.slotHeight || 1;
                slotHTML = `<div class="slot-size-${sz} slot-height-${sh}" style="grid-column: span ${sw}; grid-row: span ${sh}; min-width: 0; display: flex; flex-direction: column;">
                    <div style="flex: 1; display: flex; flex-direction: column; width: 100%;">
                        ${slotHTML}
                    </div>
                </div>`;
            }
            col1HTML += slotHTML;
        });
    }
    if (layoutConfig.col2) {
        layoutConfig.col2.forEach((slot, index) => {
            let slotHTML = renderSlotHelper(slot, index, sorted, headlines, recentComments);
            if (!slotHTML) return;
            if (isEditorModeActive) {
                slotHTML = wrapSlotInEditorControls(slot, index, 'col2', slotHTML, col2W);
            } else {
                const sz = slot.size || 'normal';
                const sw = slot.slotWidth || 1;
                const sh = slot.slotHeight || 1;
                slotHTML = `<div class="slot-size-${sz} slot-height-${sh}" style="grid-column: span ${sw}; grid-row: span ${sh}; min-width: 0; display: flex; flex-direction: column;">
                    <div style="flex: 1; display: flex; flex-direction: column; width: 100%;">
                        ${slotHTML}
                    </div>
                </div>`;
            }
            col2HTML += slotHTML;
        });
    }
    if (layoutConfig.col3) {
        layoutConfig.col3.forEach((slot, index) => {
            let slotHTML = renderSlotHelper(slot, index, sorted, headlines, recentComments);
            if (!slotHTML) return;
            if (isEditorModeActive) {
                slotHTML = wrapSlotInEditorControls(slot, index, 'col3', slotHTML, col3W);
            } else {
                const sz = slot.size || 'normal';
                const sw = slot.slotWidth || 1;
                const sh = slot.slotHeight || 1;
                slotHTML = `<div class="slot-size-${sz} slot-height-${sh}" style="grid-column: span ${sw}; grid-row: span ${sh}; min-width: 0; display: flex; flex-direction: column;">
                    <div style="flex: 1; display: flex; flex-direction: column; width: 100%;">
                        ${slotHTML}
                    </div>
                </div>`;
            }
            col3HTML += slotHTML;
        });
    }

    // Append inline page-level "+" buttons and col-width controls when in Editor Mode
    if (isEditorModeActive) {
        const cw = layoutConfig.colWidths || { col1: 1, col2: 2, col3: 1 };

        function colWidthBar(colKey, colLabel, colW) {
            const cur = cw[colKey] || 1;
            const opts = [1, 2, 3];
            const btns = opts.map(n => {
                const active = cur === n;
                return `<button type="button" onclick="event.stopPropagation(); window.quickSetColWidth('${colKey}', ${n})" style="background:${active ? 'var(--accent-color)' : 'var(--bg-secondary)'}; color:${active ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${active ? 'var(--accent-color)' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:4px; cursor:pointer;">${n}x</button>`;
            }).join('');
            return `<div style="grid-column: 1 / -1; display:flex; align-items:center; gap:6px; margin-bottom:12px; padding:6px 10px; background:var(--bg-secondary); border-radius:6px; border:1px solid var(--border-light);">
                <span style="font-family:var(--font-ui); font-size:0.65rem; font-weight:700; color:var(--text-secondary); flex:1;">${colLabel} Genişliği:</span>
                ${btns}
            </div>`;
        }

        col1HTML = colWidthBar('col1', 'Sol Sütun', col1W) + col1HTML + `
            <button class="btn-add-slot-page" onclick="window.quickAddSlot('col1')" style="grid-column: 1 / -1; background: none; border: 2px dashed var(--border-color); width: 100%; padding: 12px; border-radius: 8px; cursor: pointer; font-family: var(--font-ui); font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-top: 10px; margin-bottom: 20px; transition: all 0.2s ease;">
                + Sol Sütuna Slot Ekle
            </button>`;
        col2HTML = colWidthBar('col2', 'Orta Sütun', col2W) + col2HTML + `
            <button class="btn-add-slot-page" onclick="window.quickAddSlot('col2')" style="grid-column: 1 / -1; background: none; border: 2px dashed var(--border-color); width: 100%; padding: 12px; border-radius: 8px; cursor: pointer; font-family: var(--font-ui); font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-top: 10px; margin-bottom: 20px; transition: all 0.2s ease;">
                + Orta Sütuna Slot Ekle
            </button>`;
        col3HTML = colWidthBar('col3', 'Sağ Sütun', col3W) + col3HTML + `
            <button class="btn-add-slot-page" onclick="window.quickAddSlot('col3')" style="grid-column: 1 / -1; background: none; border: 2px dashed var(--border-color); width: 100%; padding: 12px; border-radius: 8px; cursor: pointer; font-family: var(--font-ui); font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-top: 10px; margin-bottom: 20px; transition: all 0.2s ease;">
                + Sağ Sütuna Slot Ekle
            </button>`;
    }

    // Assembly
    mainGrid.innerHTML = `
        <div class="news-column" style="display: grid; grid-template-columns: repeat(${col1W}, 1fr); gap: 16px; align-content: start;">${col1HTML}</div>
        <div class="news-column" style="display: grid; grid-template-columns: repeat(${col2W}, 1fr); gap: 16px; align-content: start;">${col2HTML}</div>
        <div class="news-column" style="display: grid; grid-template-columns: repeat(${col3W}, 1fr); gap: 16px; align-content: start;">${col3HTML}</div>
    `;

    // Render Bottom Pagination Controls
    const paginationEl = document.getElementById("newspaper-pagination");
    if (paginationEl) {
        if (totalPages > 1) {
            paginationEl.classList.remove("hidden");
            let pagesButtons = "";
            for (let i = 1; i <= totalPages; i++) {
                pagesButtons += `
                    <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}" style="${i === currentPage ? 'color: var(--accent-color); border-bottom: 2px solid var(--accent-color); font-weight: 900;' : ''}">
                        SAYFA ${i}
                    </button>
                `;
            }
            paginationEl.innerHTML = `
                <button class="pagination-btn" id="prev-page-btn" ${currentPage === 1 ? 'disabled' : ''}>◀ Önceki</button>
                <div class="pagination-numbers" style="display: flex; gap: 8px;">${pagesButtons}</div>
                <button class="pagination-btn" id="next-page-btn" ${currentPage === totalPages ? 'disabled' : ''}>Sonraki ▶</button>
            `;
            
            // Add listeners to page numbers
            paginationEl.querySelectorAll(".pagination-btn[data-page]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const targetPage = parseInt(btn.getAttribute("data-page"));
                    changePage(targetPage);
                });
            });
            
            const prevBtn = document.getElementById("prev-page-btn");
            if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                    if (currentPage > 1) changePage(currentPage - 1);
                });
            }
            
            const nextBtn = document.getElementById("next-page-btn");
            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    if (currentPage < totalPages) changePage(currentPage + 1);
                });
            }
        } else {
            paginationEl.classList.add("hidden");
        }
    }

    // Add click listeners to all generated cards and popular item list items
    document.querySelectorAll(".article-card[data-id], .popular-item[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
            e.stopPropagation();
            const articleId = card.getAttribute("data-id");
            openArticle(articleId);
        });
    });
}


// RENDER FEED LIST VIEW FOR CATEGORIES
function renderCategoryFeed(category) {
    mainGrid.className = "newspaper-grid feed-view-active"; // change class for layout styling

    // Filter articles belonging to selected category or bookmarks
    let filteredArticles = [];
    if (category === "bookmarks") {
        filteredArticles = articles.filter(a => savedArticleIds.includes(a.id));
    } else {
        filteredArticles = articles.filter(a => a.category === category || (category === 'kose-yazilari' && a.category === 'kose-yazilari'));
    }
    
    if (filteredArticles.length === 0) {
        if (category === "bookmarks") {
            mainGrid.innerHTML = `
                <div class="empty-feed-message" style="grid-column: span 3; text-align: center; padding: 60px 20px; font-family: var(--font-body);">
                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: var(--text-secondary); margin-bottom: 15px;"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
                    <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 10px;">Henüz Kayıtlı Yazı Yok</h3>
                    <p style="color: var(--text-secondary);">Beğendiğiniz yazıları okuma penceresindeki kaydet butonuyla buraya ekleyebilirsiniz.</p>
                </div>
            `;
        } else {
            mainGrid.innerHTML = `
                <div class="empty-feed-message" style="grid-column: span 3; text-align: center; padding: 60px 20px; font-family: var(--font-body);">
                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: var(--text-secondary); margin-bottom: 15px;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z"/></svg>
                    <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 10px;">Henüz Bu Kategoride Yazı Yok</h3>
                    <p style="color: var(--text-secondary);">İlk yazıyı yazmak ve bu alanı hareketlendirmek ister misiniz?</p>
                    <button onclick="document.getElementById('write-toggle').click()" style="margin-top: 20px; background-color: var(--accent-color); color: #fff; border: none; padding: 10px 24px; border-radius: 20px; font-family: var(--font-ui); font-weight: 600; cursor: pointer;">Yazı Yaz</button>
                </div>
            `;
        }
        return;
    }

    // Build feed view in list layout (occupies center, simple list cards)
    let listHTML = "";
    filteredArticles.slice().reverse().forEach(art => {
        const reports = getArticleReports(art.id);
        if (reports >= 3 && !isEditorModeActive) {
            listHTML += `
                <div class="moderated-content-placeholder" style="grid-column: span 3; padding: 20px; text-align: center; border: 1px dashed var(--border-light); border-radius: 8px; background: var(--bg-secondary); margin-bottom: 15px;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">⚠️ Bu yazı okur şikayetleri nedeniyle geçici olarak gizlenmiştir.</p>
                </div>
            `;
            return;
        }

        listHTML += `
            <div class="feed-item-card ${reports > 0 ? 'flagged' : ''}" data-id="${art.id}" style="grid-column: span 3; display: flex; flex-direction: column; gap: 15px; border-bottom: 1px solid var(--border-light); padding: 30px 0; cursor: pointer; position: relative;">
                ${(reports > 0 && isEditorModeActive) ? `<div class="flag-badge" style="top: 15px; right: 15px;">⚠️ Şikayet: ${reports}</div>` : ''}
                <div style="display: flex; gap: 30px; align-items: center; width: 100%;">
                    <div style="flex: 1;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-color); text-transform: uppercase; margin-bottom: 10px;">${art.category.replace("-", " ")}</div>
                        <h3 style="font-family: var(--font-header); font-size: 2rem; font-weight: 800; line-height: 1.2; margin-bottom: 10px; color: var(--text-primary);">${art.title}</h3>
                        <p style="font-family: var(--font-body); font-size: 1.05rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 15px;">${art.subtitle}</p>
                        <div style="display: flex; gap: 10px; align-items: center; font-size: 0.8rem; color: var(--text-secondary);">
                            <span style="font-weight: 600; color: var(--text-primary);">${art.author}</span>
                            <span>•</span>
                            <span>${art.date}</span>
                            <span>•</span>
                            <span>${art.readTime || (art.content ? calculateReadTime(art.content) : '3 dk okuma')}</span>
                            <span>•</span>
                            <span style="display: inline-flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-1.78 12.77c-.31.31-.69.43-1.07.43-.38 0-.76-.12-1.07-.43-.59-.59-.59-1.54 0-2.12l4.9-4.9c.59-.59 1.54-.59 2.12 0 .59.59.59 1.54 0 2.12l-4.88 4.9zm4.78-4.78c.31-.31.69-.43 1.07-.43.38 0 .76.12 1.07.43.59.59.59 1.54 0 2.12l-4.9 4.9c-.3.3-.68.44-1.06.44-.38 0-.76-.14-1.06-.44-.59-.59-.59-1.54 0-2.12l4.95-4.91z"/></svg>${art.claps}</span>
                        </div>
                    </div>
                    ${art.image ? `
                    <div style="width: 180px; height: 120px; border: 1px solid var(--border-light); padding: 3px; background-color: var(--bg-primary); flex-shrink: 0;">
                        <img src="${art.image}" alt="${art.title}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(80%);">
                    </div>` : ''}
                </div>
                ${isEditorModeActive ? `
                    <div class="editor-card-controls" onclick="event.stopPropagation();" style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn-editor-action approve" onclick="window.approveArticleClick('${art.id}', event)">Onayla</button>
                        <button class="btn-editor-action delete" onclick="window.deleteArticleClick('${art.id}', event)">Yayından Kaldır</button>
                    </div>
                ` : ''}
            </div>
        `;
    });

    const displayCategoryName = category === "bookmarks" ? "KAYDEDİLENLER" : category.replace("-", " ");

    mainGrid.innerHTML = `
        <div class="category-feed-container" style="grid-column: span 3; max-width: 800px; margin: 0 auto; width: 100%;">
            <header style="border-bottom: 2px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                <h2 style="font-family: var(--font-header); font-size: 2.2rem; font-weight: 800; text-transform: uppercase;">${displayCategoryName}</h2>
            </header>
            <div class="feed-list">${listHTML}</div>
        </div>
    `;

    // Add click listeners to items in feed list
    document.querySelectorAll(".feed-item-card[data-id]").forEach(card => {
        card.addEventListener("click", () => {
            const articleId = card.getAttribute("data-id");
            openArticle(articleId);
        });
    });
}

// Open Medium Reader Modal
async function openArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    activeArticleId = id;

    // Track article view
    trackPageVisit("Yazı: " + article.title, article.id, article.category);
    
    // Set text contents
    detailCategory.innerText = article.category.replace("-", " ");
    detailTitle.innerText = article.title;
    detailSubtitle.innerText = article.subtitle;
    
    // Render author name with rank badge and bind click handler
    const rankBadge = getAuthorRankBadgeHtml(article.author);
    detailAuthor.innerHTML = `${article.author}${rankBadge}`;
    detailAuthor.style.cursor = "pointer";
    detailAuthor.style.textDecoration = "underline";
    detailAuthor.style.textUnderlineOffset = "2px";
    detailAuthor.onclick = () => { window.openAuthorProfile(article.author); };
    
    // Style avatar and bind click handler
    if (detailAvatarContainer) {
        detailAvatarContainer.onclick = () => { window.openAuthorProfile(article.author); };
    }

    detailDate.innerText = article.date;
    detailClapCount.innerText = article.claps;
    detailImage.src = article.image || 'assets/typewriter_birds.webp';
    detailImage.onerror = function() { this.onerror=null; this.src='assets/typewriter_birds.webp'; };
    
    // Check if clapped previously in this session
    const clappedArticles = JSON.parse(sessionStorage.getItem("clapped_articles") || "[]");
    if (clappedArticles.includes(id)) {
        detailClapBtn.classList.add("clapped");
    } else {
        detailClapBtn.classList.remove("clapped");
    }

    // Set author avatar dynamically using our customization system
    if (detailAvatarContainer) {
        detailAvatarContainer.innerHTML = getAuthorAvatarHtml(article.author, 44);
    }

    // Show Overlay with fade/slide animations
    readingOverlay.classList.remove("hidden");
    lockBodyScroll(); // lock page scroll
    readingOverlay.scrollTop = 0;
    readingProgress.style.width = "0%";

    // Update editor buttons in reader overlay
    const approveBtn = document.getElementById("article-editor-approve-btn");
    const deleteBtn = document.getElementById("article-editor-delete-btn");
    if (approveBtn && deleteBtn) {
        const isOwnArticle = currentUser && currentUser.username &&
            currentUser.username.trim().toLowerCase() === article.author.trim().toLowerCase();

        if (isEditorModeActive) {
            approveBtn.classList.remove("hidden");
            deleteBtn.classList.remove("hidden");
            deleteBtn.innerText = "Kaldır";
        } else if (isOwnArticle) {
            approveBtn.classList.add("hidden");
            deleteBtn.classList.remove("hidden");
            deleteBtn.innerText = "Yazıyı Sil";
        } else {
            approveBtn.classList.add("hidden");
            deleteBtn.classList.add("hidden");
        }
    }

    // Handle article edit button
    if (articleEditorEditBtn) {
        const isOwnArticle = currentUser && currentUser.username &&
            currentUser.username.trim().toLowerCase() === article.author.trim().toLowerCase();
        const canEdit = isOwnArticle || (currentUser && (currentUser.isEditor || currentUser.isAdmin));
        if (canEdit) {
            articleEditorEditBtn.classList.remove("hidden");
            articleEditorEditBtn.onclick = (e) => { window.editArticleClick(id, e); };
        } else {
            articleEditorEditBtn.classList.add("hidden");
        }
    }

    // Render comments initially (even if article text is loading)
    renderArticleComments(id);

    // Dynamic loading of article body content
    if (isSupabaseConnected && !article.content) {
        detailReadtime.innerText = article.readTime || "...";
        detailContent.innerHTML = `
            <div class="content-loader">
                <div class="spinner"></div>
                <p style="font-family: var(--font-body); font-size: 1.1rem; color: var(--text-secondary);">Yazı içeriği yükleniyor...</p>
            </div>
        `;

        try {
            const { data, error } = await supabaseClient
                .from('articles')
                .select('content, read_time')
                .eq('id', id)
                .single();
            
            if (error) throw error;

            article.content = data.content;
            if (data.read_time) {
                article.readTime = data.read_time;
            }
        } catch (err) {
            console.error("Error loading article content from Supabase:", err);
            detailContent.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-secondary); font-family: var(--font-body);">
                    <p style="margin-bottom: 15px;">Yazı içeriği yüklenirken bir hata oluştu.</p>
                    <button onclick="openArticle('${id}')" style="background-color: var(--accent-color); color: #fff; border: none; padding: 8px 16px; border-radius: 20px; font-family: var(--font-ui); cursor: pointer; font-weight: 600;">Tekrar Dene</button>
                </div>
            `;
            return;
        }
    }

    // Update readTime and fill content
    detailReadtime.innerText = article.readTime || calculateReadTime(article.content || '');
    detailContent.innerHTML = article.content || '<p style="color: var(--text-secondary);">Yazı içeriği bulunamadı.</p>';

    // Update bookmark UI state
    updateBookmarkBtnUI();

    // Set reported visual state for the report button in detail overlay
    const articleReportBtn = document.getElementById("article-report-btn");
    if (articleReportBtn) {
        const articleReports = getArticleReports(id);
        if (articleReports > 0) {
            articleReportBtn.classList.add("reported");
        } else {
            articleReportBtn.classList.remove("reported");
        }
    }

    // Prefill and lock commenter name if logged in; show login prompt for guests
    updateCommentFormUI();
}

function updateCommentFormUI() {
    const commentFormEl = document.getElementById("comment-form");
    const existingPrompt = document.getElementById("comment-login-prompt");
    
    if (currentUser) {
        // Logged in: show form, remove prompt
        if (commentFormEl) commentFormEl.style.display = "";
        if (existingPrompt) existingPrompt.remove();
        commentAuthorInput.value = currentUser.username || currentUser.email.split("@")[0];
        commentAuthorInput.disabled = true;
    } else {
        // Guest: hide form, show premium login prompt
        if (commentFormEl) commentFormEl.style.display = "none";
        if (!existingPrompt) {
            const prompt = document.createElement("div");
            prompt.id = "comment-login-prompt";
            prompt.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 14px;
                padding: 28px 24px;
                border: 1px solid var(--border-light);
                border-radius: 12px;
                background: var(--bg-secondary);
                text-align: center;
                margin-bottom: 20px;
            `;
            prompt.innerHTML = `
                <svg style="width:32px;height:32px;fill:var(--accent-color);opacity:0.8;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                <p style="font-family:var(--font-body);font-size:1rem;color:var(--text-secondary);line-height:1.5;">Yorum yapabilmek için topluluğumuza katılın.</p>
                <div style="display:flex;gap:10px;">
                    <button onclick="openAuthModal();switchAuthTab('login');" style="background-color:var(--accent-color);color:#fff;border:none;padding:10px 22px;border-radius:20px;font-family:var(--font-ui);font-size:0.85rem;font-weight:700;cursor:pointer;transition:background-color 0.2s;">Giriş Yap</button>
                    <button onclick="openAuthModal();switchAuthTab('register');" style="background-color:transparent;color:var(--text-primary);border:1px solid var(--border-color);padding:10px 22px;border-radius:20px;font-family:var(--font-ui);font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;">Kayıt Ol</button>
                </div>
            `;
            if (commentFormEl) {
                commentFormEl.parentNode.insertBefore(prompt, commentFormEl);
            }
        }
        commentAuthorInput.disabled = false;
    }
}



// Close Medium Reader Modal
function closeArticle() {
    readingOverlay.classList.add("hidden");
    if (commentsDrawer && !commentsDrawer.classList.contains("hidden")) {
        commentsDrawer.classList.add("hidden");
        unlockBodyScroll();
    }
    unlockBodyScroll(); // restore page scroll
    activeArticleId = null;
}

// RENDER COMMENTS FOR ARTICLE
function renderArticleComments(articleId) {
    const articleComments = comments.filter(c => c.articleId === articleId);
    const count = articleComments.length;

    if (commentsTotalCountEl) commentsTotalCountEl.innerText = count;
    
    const articleCommentsCountEl = document.getElementById("article-comments-count");
    if (articleCommentsCountEl) articleCommentsCountEl.innerText = count;
    
    const commentsDrawerCountEl = document.getElementById("comments-drawer-count");
    if (commentsDrawerCountEl) commentsDrawerCountEl.innerText = count;

    let commentsHTML = "";
    articleComments.slice().reverse().forEach(c => {
        const reports = getCommentReports(c.id);
        if (reports >= 3 && !isEditorModeActive) {
            commentsHTML += `
                <div class="comment-card" style="opacity: 0.6; padding: 15px; text-align: center; border: 1px dashed var(--border-light); background: var(--bg-secondary); margin-bottom: 15px;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">⚠️ Bu yorum uygunsuz içerik bildirimleri nedeniyle gizlenmiştir.</p>
                </div>
            `;
            return;
        }

        const isOwnComment = currentUser && (
            c.author === currentUser.username || 
            c.author === (currentUser.email ? currentUser.email.split("@")[0] : "")
        );

        const article = articles.find(a => a.id === articleId);
        const isCommentOnOwnArticle = currentUser && article && article.author && (
            normalizeTurkishString(article.author) === normalizeTurkishString(currentUser.username)
        );

        const canDelete = isOwnComment || isCommentOnOwnArticle || (currentUser && currentUser.isEditor);

        let actionControlHtml = "";
        if (isEditorModeActive) {
            actionControlHtml = `
                <div style="display: flex; gap: 8px;">
                    <button class="btn-editor-action approve" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.approveCommentClick('${c.id}', '${articleId}', event)">Onayla</button>
                    <button class="btn-editor-action delete" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.deleteCommentClick('${c.id}', '${articleId}', event)">Sil</button>
                </div>
            `;
        } else {
            let buttons = [];
            if (isOwnComment) {
                buttons.push(`<button class="btn-editor-action edit" style="padding: 4px 10px; font-size: 0.7rem; background-color: var(--border-light); color: var(--text-primary);" onclick="window.editCommentInline('${c.id}', '${articleId}', event)">Düzenle</button>`);
            }
            if (canDelete) {
                buttons.push(`<button class="btn-editor-action delete" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.deleteCommentClick('${c.id}', '${articleId}', event)">Sil</button>`);
            }
            if (buttons.length > 0) {
                actionControlHtml = `<div style="display: flex; gap: 8px;">${buttons.join("")}</div>`;
            }
        }

        commentsHTML += `
            <div class="comment-card ${reports > 0 ? 'flagged' : ''}" id="comment-${c.id}" style="position: relative; padding: 16px; margin-bottom: 15px;">
                ${(reports > 0 && isEditorModeActive) ? `<div class="flag-badge" style="top: 10px; right: 10px;">⚠️ Şikayet: ${reports}</div>` : ''}
                <div class="comment-header" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span class="commenter-name" style="font-weight: 700;">${c.author}</span>
                    <span class="comment-date" style="font-size: 0.75rem; color: var(--text-secondary);">${c.date}</span>
                </div>
                <p class="comment-body" style="font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">${c.text}</p>
                <div class="comment-report-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid var(--border-light); padding-top: 8px;">
                    <button class="btn-comment-report ${reports > 0 ? 'reported' : ''}" onclick="window.reportCommentClick('${c.id}', '${articleId}', event)">
                        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor; margin-right: 4px; display: inline-block; vertical-align: middle;"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg>
                        <span style="font-size: 0.75rem; font-weight: 600;">${reports > 0 ? 'Şikayet Edildi (' + reports + ')' : 'Şikayet Et'}</span>
                    </button>
                    ${actionControlHtml}
                </div>
            </div>
        `;
    });

    commentsListContainer.innerHTML = commentsHTML || `<p style="color: var(--text-secondary); text-align: center; padding: 20px 0;">Bu yazıya henüz yorum yazılmamış. İlk yorumu siz yazın!</p>`;
}

// ── COMMENT INLINE EDITING ──────────────────────────────────
window.editCommentInline = function(id, articleId, event) {
    if (event) event.stopPropagation();
    const commentEl = document.getElementById(`comment-${id}`);
    if (!commentEl) return;
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    // Check if already editing
    if (commentEl.querySelector('.comment-edit-textarea')) return;
    
    const bodyEl = commentEl.querySelector('.comment-body');
    const originalText = comment.text;
    
    bodyEl.innerHTML = `
        <textarea class="comment-edit-textarea comment-input" style="width: 100%; margin-top: 8px;" rows="2">${originalText}</textarea>
        <div style="display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end;">
            <button class="btn-editor-action approve" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.saveCommentInline('${id}', '${articleId}', event)">Kaydet</button>
            <button class="btn-editor-action delete" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.cancelCommentInline('${id}', '${articleId}', event)">İptal</button>
        </div>
    `;
};

window.saveCommentInline = async function(id, articleId, event) {
    if (event) event.stopPropagation();
    const commentEl = document.getElementById(`comment-${id}`);
    if (!commentEl) return;
    
    const textarea = commentEl.querySelector('.comment-edit-textarea');
    if (!textarea) return;
    
    const newText = textarea.value.trim();
    if (!newText) {
        showToast("Yorum alanı boş bırakılamaz.");
        return;
    }
    
    if (containsProfanity(newText)) {
        showToast("❌ Yorumunuz topluluk kurallarına aykırı ifadeler içermektedir.");
        return;
    }
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    comment.text = newText;
    
    if (isSupabaseConnected) {
        try {
            await supabaseClient
                .from('comments')
                .update({ text: newText })
                .eq('id', id);
        } catch (err) {
            console.error("Error updating comment on Supabase:", err);
        }
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
    }
    
    showToast("Yorum güncellendi.");
    renderArticleComments(articleId);
};

window.cancelCommentInline = function(id, articleId, event) {
    if (event) event.stopPropagation();
    renderArticleComments(articleId);
};

// ── ARTICLE EDITING ─────────────────────────────────────────
function convertHtmlToRawText(html) {
    if (!html) return "";
    let text = html;
    text = text.replace(/<\/p>\s*<p>/gi, "\n\n");
    text = text.replace(/<\/?p>/gi, "");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || text;
}

window.editArticleClick = function(id, event) {
    if (event) event.stopPropagation();
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    editingArticleId = id;
    
    // Fill the Writer Studio forms
    document.getElementById("post-title").value = article.title;
    document.getElementById("post-subtitle").value = article.subtitle;
    document.getElementById("post-author").value = article.author;
    document.getElementById("post-category").value = article.category;
    
    const cornerNameInput = document.getElementById("post-corner-name");
    if (cornerNameInput) {
        cornerNameInput.value = article.corner_name || "";
    }
    
    // Select the image
    const imgInput = document.querySelector(`input[name="post-image"][value="${article.image}"]`);
    if (imgInput) imgInput.checked = true;
    
    // Content HTML to Raw text
    document.getElementById("post-content").value = convertHtmlToRawText(article.content);
    
    // Change UI titles
    const studioTitle = document.querySelector(".editor-studio-header h2");
    if (studioTitle) studioTitle.innerText = "Yazı Düzenle";
    
    const studioDesc = document.querySelector(".editor-studio-header p");
    if (studioDesc) studioDesc.innerText = "Yazınız üzerinde değişiklikleri yapın ve güncelleyin.";
    
    const submitBtn = document.querySelector(".btn-publish-submit");
    if (submitBtn) submitBtn.innerText = "Değişiklikleri Kaydet";
    
    // Open editor overlay
    const editorOverlay = document.getElementById("editor-overlay");
    if (editorOverlay) {
        editorOverlay.classList.remove("hidden");
        lockBodyScroll();
    }
};

// ── COMMENTS DRAWER CONTROLS ────────────────────────────────
function openCommentsDrawer() {
    if (commentsDrawer) {
        commentsDrawer.classList.remove("hidden");
        lockBodyScroll();
        if (activeArticleId) {
            renderArticleComments(activeArticleId);
        }
    }
}

function closeCommentsDrawer() {
    if (commentsDrawer) {
        commentsDrawer.classList.add("hidden");
        unlockBodyScroll();
    }
}

// EVENT LISTENERS

// Comments Drawer Toggles
commentsTriggerBar?.addEventListener("click", openCommentsDrawer);
articleCommentBtn?.addEventListener("click", openCommentsDrawer);
closeCommentsDrawerBtn?.addEventListener("click", closeCommentsDrawer);
commentsDrawerBackdrop?.addEventListener("click", closeCommentsDrawer);

// Reading Overlay Scroll Progress
readingOverlay.addEventListener("scroll", () => {
    const scrollTop = readingOverlay.scrollTop;
    const scrollHeight = readingOverlay.scrollHeight;
    const clientHeight = readingOverlay.clientHeight;
    
    if (scrollHeight - clientHeight > 0) {
        const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        readingProgress.style.width = `${percentage}%`;
    }
});

// Theme Switcher (Light / Dark)
themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("murekkep_theme", newTheme);
    
    // Toggle sun / moon icons
    document.querySelector(".icon-sun").classList.toggle("hidden");
    document.querySelector(".icon-moon").classList.toggle("hidden");
});

// Initialize Theme
const savedTheme = localStorage.getItem("murekkep_theme") || "light";
if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector(".icon-sun").classList.remove("hidden");
    document.querySelector(".icon-moon").classList.add("hidden");
}

// Writer Studio Overlay Toggle — requires login
writeToggleBtn.addEventListener("click", () => {
    if (!currentUser) {
        openAuthModal();
        showToast("Yazı yayınlamak için lütfen giriş yapın.");
        return;
    }
    editorOverlay.classList.remove("hidden");
    lockBodyScroll();
    
    // Prefill the author name to match user profile exactly
    const authorInput = document.getElementById("post-author");
    if (authorInput && currentUser.username) {
        authorInput.value = currentUser.username;
    }

    // Limit category select dynamically to prevent regular users from selecting admin categories
    const categorySelect = document.getElementById("post-category");
    if (categorySelect) {
        categorySelect.innerHTML = "";
        const baseOptions = [
            { id: "siir", name: "Şiir" },
            { id: "oyku", name: "Öykü" },
            { id: "deneme", name: "Deneme" },
            { id: "kitap", name: "Kitap İncelemesi" },
            { id: "roportaj", name: "Yazar Röportajı" },
            { id: "kose-yazilari", name: "Köşe Yazısı" }
        ];

        if (currentUser.isEditor) {
            baseOptions.push({ id: "haber", name: "Edebiyat Haberleri" });
            baseOptions.push({ id: "yarismalar", name: "Yarışmalar" });
        }

        customCategories.forEach(cat => {
            if (!baseOptions.some(o => o.id === cat.id)) {
                baseOptions.push(cat);
            }
        });

        baseOptions.forEach(opt => {
            const el = document.createElement("option");
            el.value = opt.id;
            el.textContent = opt.name;
            categorySelect.appendChild(el);
        });

        categorySelect.value = "deneme";
    }
});

closeEditorBtn.addEventListener("click", () => {
    editingArticleId = null;
    const studioTitle = document.querySelector(".editor-studio-header h2");
    if (studioTitle) studioTitle.innerText = "Yazarlık Stüdyosu";
    const studioDesc = document.querySelector(".editor-studio-header p");
    if (studioDesc) studioDesc.innerText = "Edebiyat hareketinin bir parçası olun. Yazınızı kaleme alın ve Mürekkep sayfalarında yayınlayın.";
    const submitBtn = document.querySelector(".btn-publish-submit");
    if (submitBtn) submitBtn.innerText = "Gazetede Yayınla";
    publishForm.reset();
    editorOverlay.classList.add("hidden");
    unlockBodyScroll();
});

// Close Reading modal on back button
closeReadingBtn.addEventListener("click", closeArticle);

// Supabase Configuration Overlay Elements
const supabaseOverlay = document.getElementById("supabase-overlay");
const closeSupabaseBtn = document.getElementById("close-supabase");
const supabaseConfigForm = document.getElementById("supabase-config-form");
const sbUrlInput = document.getElementById("sb-url");
const sbKeyInput = document.getElementById("sb-key");
const sbDisconnectBtn = document.getElementById("sb-disconnect-btn");
const supabaseConfigBtn = document.getElementById("supabase-config-btn");

console.log("Supabase config btn element:", supabaseConfigBtn);
console.log("Supabase overlay element:", supabaseOverlay);

if (supabaseConfigBtn && supabaseOverlay) {
    supabaseConfigBtn.addEventListener("click", () => {
        console.log("Supabase config button clicked!");
        // Populate inputs with current stored values
        sbUrlInput.value = localStorage.getItem("murekkep_supabase_url") || "";
        sbKeyInput.value = localStorage.getItem("murekkep_supabase_key") || "";
        
        // Show modal overlay
        supabaseOverlay.classList.remove("hidden");
        lockBodyScroll();
    });
}

if (closeSupabaseBtn && supabaseOverlay) {
    closeSupabaseBtn.addEventListener("click", () => {
        supabaseOverlay.classList.add("hidden");
        unlockBodyScroll();
    });
}

if (supabaseConfigForm) {
    supabaseConfigForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newUrl = sbUrlInput.value.trim();
        const newKey = sbKeyInput.value.trim();

        if (newUrl && newKey) {
            localStorage.setItem("murekkep_supabase_url", newUrl);
            localStorage.setItem("murekkep_supabase_key", newKey);
            clearSupabaseCache();
            
            // Re-initialize and reload
            initSupabase();
            loadData();

            // Close modal
            supabaseOverlay.classList.add("hidden");
            unlockBodyScroll();
        }
    });
}

if (sbDisconnectBtn) {
    sbDisconnectBtn.addEventListener("click", () => {
        // Clear stored credentials
        localStorage.removeItem("murekkep_supabase_url");
        localStorage.removeItem("murekkep_supabase_key");
        clearSupabaseCache();
        
        supabaseClient = null;
        isSupabaseConnected = false;
        updateSupabaseUI();
        loadLocalStorageFallback();
        
        currentPage = 1;
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }

        // Close modal
        supabaseOverlay.classList.add("hidden");
        unlockBodyScroll();
    });
}

// Article Clapping interaction
detailClapBtn.addEventListener("click", async () => {
    if (!currentUser) {
        openAuthModal();
        showToast("Alkışlamak için lütfen giriş yapın.");
        return;
    }
    if (!activeArticleId) return;

    const clappedArticles = JSON.parse(sessionStorage.getItem("clapped_articles") || "[]");
    
    if (!clappedArticles.includes(activeArticleId)) {
        let updatedClaps = 0;
        // Increment claps
        articles = articles.map(art => {
            if (art.id === activeArticleId) {
                art.claps += 1;
                updatedClaps = art.claps;
                detailClapCount.innerText = art.claps;
            }
            return art;
        });

        clappedArticles.push(activeArticleId);
        sessionStorage.setItem("clapped_articles", JSON.stringify(clappedArticles));

        if (isSupabaseConnected) {
            try {
                await supabaseClient
                    .from('articles')
                    .update({ claps: updatedClaps })
                    .eq('id', activeArticleId);
            } catch (err) {
                console.error("Error updating claps on Supabase:", err);
            }
            clearSupabaseCache();
        } else {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        }

        detailClapBtn.classList.add("clapped");
        
        // Clap notification trigger
        const clappedArt = articles.find(a => a.id === activeArticleId);
        if (clappedArt && clappedArt.author) {
            createNotification(clappedArt.author, 'clap', currentUser.username, `"${clappedArt.title}" isimli eserinizi alkışladı.`, { articleId: clappedArt.id });
        }

        // Dynamic feed refresh if in list view, or dynamic grid refresh
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }
});

// Submit Reader Comment
commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
        openAuthModal();
        showToast("Yorum yapabilmek için lütfen giriş yapın.");
        return;
    }
    if (!activeArticleId) return;

    const authorName = commentAuthorInput.value.trim();
    const commentText = commentTextInput.value.trim();
    
    if (!authorName || !commentText) return;

    // Profanity check
    let hasError = false;
    commentAuthorInput.classList.remove("profanity-error");
    commentTextInput.classList.remove("profanity-error");

    if (containsProfanity(authorName)) {
        commentAuthorInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(commentText)) {
        commentTextInput.classList.add("profanity-error");
        hasError = true;
    }

    if (hasError) {
        showToast("❌ Yorumunuz veya kalem isminiz uygunsuz ifadeler (küfür/argo) içermektedir.");
        return;
    }

    const newComment = {
        id: "c_" + Date.now(),
        articleId: activeArticleId,
        author: authorName,
        text: commentText,
        date: formatDate(new Date())
    };

    comments.push(newComment);

    if (isSupabaseConnected) {
        try {
            await supabaseClient
                .from('comments')
                .insert({
                    id: newComment.id,
                    article_id: newComment.articleId,
                    author: newComment.author,
                    text: newComment.text,
                    date: newComment.date
                });
        } catch (err) {
            console.error("Error inserting comment on Supabase:", err);
        }
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
    }

    // Comment notification trigger
    const commentArt = articles.find(a => a.id === activeArticleId);
    if (commentArt && commentArt.author) {
        createNotification(commentArt.author, 'comment', currentUser.username, `"${commentArt.title}" isimli eserinize yorum yaptı.`, { articleId: commentArt.id });
    }

    // Reset inputs
    commentAuthorInput.value = "";
    commentTextInput.value = "";

    // Refresh views
    renderArticleComments(activeArticleId);
    
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
});

// Publish New Article from Writer's Studio
publishForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("post-title");
    const subtitleInput = document.getElementById("post-subtitle");
    const authorInput = document.getElementById("post-author");
    const contentInput = document.getElementById("post-content");
    const cornerNameInput = document.getElementById("post-corner-name");

    const title = titleInput.value.trim();
    const subtitle = subtitleInput.value.trim();
    const author = authorInput.value.trim();
    const category = document.getElementById("post-category").value;
    const contentText = contentInput.value.trim();
    const cornerName = cornerNameInput ? cornerNameInput.value.trim() : "";
    
    // Get selected image from radio group
    const selectedImageInput = document.querySelector('input[name="post-image"]:checked');
    const image = selectedImageInput ? selectedImageInput.value : "assets/typewriter_birds.webp";

    if (!title || !subtitle || !author || !contentText) return;

    // Reset previous error markings
    titleInput.classList.remove("profanity-error");
    subtitleInput.classList.remove("profanity-error");
    authorInput.classList.remove("profanity-error");
    contentInput.classList.remove("profanity-error");
    if (cornerNameInput) cornerNameInput.classList.remove("profanity-error");

    let hasError = false;
    if (containsProfanity(title)) {
        titleInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(subtitle)) {
        subtitleInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(author)) {
        authorInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(contentText)) {
        contentInput.classList.add("profanity-error");
        hasError = true;
    }
    if (cornerName && containsProfanity(cornerName)) {
        if (cornerNameInput) cornerNameInput.classList.add("profanity-error");
        hasError = true;
    }

    if (hasError) {
        showToast("❌ Yazınız topluluk kurallarına aykırı ifadeler (küfür/argo) içermektedir. Lütfen kelimelerinizi gözden geçirin.");
        return;
    }

    // Convert raw content text with double newlines into HTML paragraphs
    const contentHTML = contentText
        .split(/\n\s*\n/)
        .map(para => `<p>${para.replace(/\n/g, "<br>")}</p>`)
        .join("\n");

    if (editingArticleId) {
        const article = articles.find(a => a.id === editingArticleId);
        if (!article) return;
        
        article.title = title;
        article.subtitle = subtitle;
        article.author = author;
        article.category = category;
        article.image = image;
        article.content = contentHTML;
        article.corner_name = cornerName || null;
        article.readTime = calculateReadTime(contentHTML);
        
        if (isSupabaseConnected) {
            try {
                await supabaseClient
                    .from('articles')
                    .update({
                        title: article.title,
                        subtitle: article.subtitle,
                        author: article.author,
                        category: article.category,
                        image: article.image,
                        content: article.content,
                        corner_name: article.corner_name,
                        read_time: article.readTime
                    })
                    .eq('id', editingArticleId);
            } catch (err) {
                console.error("Error updating article on Supabase:", err);
            }
            clearSupabaseCache();
        } else {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        }
        
        showToast("Yazı başarıyla güncellendi.");
        editingArticleId = null;
        
        // Reset overlay titles
        const studioTitle = document.querySelector(".editor-studio-header h2");
        if (studioTitle) studioTitle.innerText = "Yazarlık Stüdyosu";
        const studioDesc = document.querySelector(".editor-studio-header p");
        if (studioDesc) studioDesc.innerText = "Edebiyat hareketinin bir parçası olun. Yazınızı kaleme alın ve Mürekkep sayfalarında yayınlayın.";
        const submitBtn = document.querySelector(".btn-publish-submit");
        if (submitBtn) submitBtn.innerText = "Gazetede Yayınla";
        
        publishForm.reset();
        editorOverlay.classList.add("hidden");
        unlockBodyScroll();
        
        // Refresh reading view and grid
        openArticle(article.id);
        
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
        return;
    }

    const newArticle = {
        id: generateId(),
        title: title,
        subtitle: subtitle,
        author: author,
        category: category,
        image: image,
        date: formatDate(new Date()),
        readTime: calculateReadTime(contentHTML),
        claps: 0,
        comments: [],
        content: contentHTML,
        corner_name: cornerName || null
    };

    // If publishing in 'manset' category, we override the previous main headlines
    if (category === 'manset') {
        // Change category to something else, or keep it, slot handles latest
    }

    articles.push(newArticle);

    if (isSupabaseConnected) {
        try {
            await supabaseClient
                .from('articles')
                .insert({
                    id: newArticle.id,
                    title: newArticle.title,
                    subtitle: newArticle.subtitle,
                    author: newArticle.author,
                    category: newArticle.category,
                    image: newArticle.image,
                    date: newArticle.date,
                    read_time: newArticle.readTime,
                    claps: newArticle.claps,
                    content: newArticle.content,
                    corner_name: newArticle.corner_name
                });
        } catch (err) {
            console.error("Error inserting article on Supabase:", err);
        }
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
    }

    // Reset and hide form
    publishForm.reset();
    editorOverlay.classList.add("hidden");
    unlockBodyScroll();

    // Navigate to the page where the new article appears
    // New model: position in overall clap-sorted list / slots per page = page number
    if (currentCategoryFilter === "all") {
        const sortedNow = getSortedArticles();
        const allSlots = [
            ...(layoutConfig.col1 || []),
            ...(layoutConfig.col2 || []),
            ...(layoutConfig.col3 || [])
        ];
        const slotCount = Math.max(1, allSlots.filter(s => s.type === 'category').length);
        const artGlobalIdx = sortedNow.findIndex(a => a.id === newArticle.id);
        const targetPage = artGlobalIdx >= 0 ? Math.floor(artGlobalIdx / slotCount) + 1 : 1;
        currentPage = targetPage;
        renderNewspaperGrid();
    }

    updateAuthUI();

    // Dynamic alert/toast
    const alertDiv = document.createElement("div");
    alertDiv.style.position = "fixed";
    alertDiv.style.bottom = "30px";
    alertDiv.style.right = "30px";
    alertDiv.style.backgroundColor = "var(--accent-color)";
    alertDiv.style.color = "#ffffff";
    alertDiv.style.padding = "16px 24px";
    alertDiv.style.borderRadius = "30px";
    alertDiv.style.fontFamily = "var(--font-ui)";
    alertDiv.style.fontWeight = "600";
    alertDiv.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
    alertDiv.style.zIndex = "2000";
    alertDiv.style.animation = "slideUp 0.3s ease";
    alertDiv.innerText = "Yazınız Mürekkep Gazetesi'nde başarıyla yayınlandı!";
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        alertDiv.style.transition = "opacity 0.5s ease";
        setTimeout(() => alertDiv.remove(), 500);
    }, 4000);
});

// Global Category Navigation logic
function filterCategory(cat) {
    currentCategoryFilter = cat;
    currentPage = 1; // Reset to page 1 on category filter changes

    // Track category/home page view
    if (cat === "all") {
        trackPageVisit("Ana Sayfa");
    } else {
        trackPageVisit("Kategori: " + cat, null, cat);
    }
    
    document.querySelectorAll(".nav-filter").forEach(btn => {
        if (btn.getAttribute("data-category") === cat) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const paginationEl = document.getElementById("newspaper-pagination");

    if (cat === "all") {
        renderNewspaperGrid();
    } else {
        if (paginationEl) paginationEl.classList.add("hidden");
        renderCategoryFeed(cat);
    }
}

// Boot Application
async function bootApp() {
    // Initialize Supabase FIRST so async load functions can use it
    initSupabase();

    // Reset layout config helper if URL contains ?reset_layout=true or ?clear_cache=true
    if (window.location.search.includes("reset_layout=true") || window.location.search.includes("clear_cache=true")) {
        try {
            // Remove all local storage keys containing "murekkep" to completely clear cache and fallback data
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.includes("murekkep")) {
                    localStorage.removeItem(key);
                }
            }
            layoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
            if (isSupabaseConnected && supabaseClient && window.location.search.includes("reset_layout=true")) {
                await supabaseClient.from('site_settings').upsert({ key: 'layout_config_v4', value: DEFAULT_LAYOUT });
            }
            console.log("All Mürekkep localStorage keys cleared and layout reset successfully.");
        } catch (e) {
            console.error("Failed to reset/clear layout:", e);
        }
        window.location.href = window.location.origin + window.location.pathname;
        return;
    }

    // Now load site settings (Supabase-first, localStorage fallback)
    await Promise.all([
        loadCategories(),
        loadLayoutConfig(),
        loadEditorNoteData(),
        loadAuthorProfiles(),
        loadAuthorFollowers(),
        loadUserRoles()
    ]);

    await initAuth();

    renderCategoriesNav();
    renderCategoriesDropdown();
    renderCustomCategoriesList();
    populateEditorSettingsUI();
    renderLayoutConfigurator();

    const addCatBtn = document.getElementById("add-category-btn");
    if (addCatBtn) {
        addCatBtn.addEventListener("click", window.addCustomCategory);
    }

    const adminCreateUserBtn = document.getElementById("admin-create-user-btn");
    if (adminCreateUserBtn) {
        adminCreateUserBtn.addEventListener("click", window.createUserInAdmin);
    }

    const saveLayBtn = document.getElementById("save-layout-btn");
    if (saveLayBtn) {
        saveLayBtn.addEventListener("click", window.saveLayoutFromUI);
    }

    loadData();
    trackPageVisit("Ana Sayfa");
    initProfileCustomizer();
    initAuthorSearch();
    initNotifications();
    
    // Category Navigation Click Listeners
    document.querySelectorAll(".nav-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-category");
            filterCategory(cat);
        });
    });

    // Auth Event Listeners
    if (loginToggleBtn) {
        loginToggleBtn.addEventListener("click", openAuthModal);
    }
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", closeAuthModal);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            toggleProfileDropdown(true);
            signOutUser();
        });
    }

    // Forgot Password flow
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const sendResetBtn = document.getElementById("send-reset-btn");
    const backToLoginBtn = document.getElementById("back-to-login-btn");

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", () => {
            const loginForm = document.getElementById("login-form");
            const resetForm = document.getElementById("reset-form");
            const loginEmail = document.getElementById("login-email");
            const resetEmail = document.getElementById("reset-email");
            if (loginForm) loginForm.classList.add("hidden");
            if (resetForm) resetForm.classList.remove("hidden");
            // Pre-fill email if already typed
            if (resetEmail && loginEmail && loginEmail.value) {
                resetEmail.value = loginEmail.value;
            }
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", () => {
            const loginForm = document.getElementById("login-form");
            const resetForm = document.getElementById("reset-form");
            if (resetForm) resetForm.classList.add("hidden");
            if (loginForm) loginForm.classList.remove("hidden");
        });
    }

    if (sendResetBtn) {
        sendResetBtn.addEventListener("click", () => {
            const resetEmail = document.getElementById("reset-email");
            if (resetEmail) sendPasswordReset(resetEmail.value.trim());
        });
    }

    // Handle password recovery redirect (when user clicks email link)
    handlePasswordRecovery();

    // Profile Dropdown toggle
    if (profileAvatarBtn) {
        profileAvatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleProfileDropdown();
        });
    }

    // Dropdown: Kaydedilenler
    if (dropdownBookmarksBtn) {
        dropdownBookmarksBtn.addEventListener("click", () => {
            toggleProfileDropdown(true);
            filterCategory("bookmarks");
        });
    }

    // Dropdown: Ayarlar
    if (dropdownSettingsBtn) {
        dropdownSettingsBtn.addEventListener("click", () => {
            toggleProfileDropdown(true);
            openSettingsModal();
        });
    }

    // Close dropdown when clicking anywhere outside
    document.addEventListener("click", (e) => {
        if (profileDropdownMenu && !profileDropdownMenu.classList.contains("hidden")) {
            if (!userProfileSection.contains(e.target)) {
                toggleProfileDropdown(true);
            }
        }
    });

    // Close dropdown on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            toggleProfileDropdown(true);
        }
    });

    // Tab switching inside auth modal
    if (tabLogin) {
        tabLogin.addEventListener("click", () => switchAuthTab('login'));
    }
    if (tabRegister) {
        tabRegister.addEventListener("click", () => switchAuthTab('register'));
    }

    // Close auth modal when clicking the dark backdrop
    if (authOverlay) {
        authOverlay.addEventListener("click", (e) => {
            if (e.target === authOverlay) closeAuthModal();
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();
            if (email && password) {
                signInUser(email, password);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("register-username").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value.trim();
            if (username && email && password) {
                signUpUser(email, password, username);
            }
        });
    }

    if (articleSaveBtn) {
        articleSaveBtn.addEventListener("click", () => {
            if (!currentUser) {
                openAuthModal();
                showToast("Yazıyı kaydetmek için lütfen giriş yapın.");
                return;
            }
            if (!activeArticleId) return;

            const idx = savedArticleIds.indexOf(activeArticleId);
            if (idx === -1) {
                savedArticleIds.push(activeArticleId);
                showToast("Yazı kaydedildi!");
            } else {
                savedArticleIds.splice(idx, 1);
                showToast("Yazı kaydedilenlerden çıkarıldı.");
            }
            saveBookmarks();
        });
    }

    // Article Share Button
    const articleShareBtn = document.getElementById("article-share-btn");
    if (articleShareBtn) {
        articleShareBtn.addEventListener("click", () => {
            if (activeArticleId) {
                openShareModal(activeArticleId);
            }
        });
    }

    // Article Editor Buttons in Reader Overlay
    const articleEditorApproveBtn = document.getElementById("article-editor-approve-btn");
    if (articleEditorApproveBtn) {
        articleEditorApproveBtn.addEventListener("click", (e) => {
            if (activeArticleId) {
                window.approveArticleClick(activeArticleId, e);
            }
        });
    }
    const articleEditorDeleteBtn = document.getElementById("article-editor-delete-btn");
    if (articleEditorDeleteBtn) {
        articleEditorDeleteBtn.addEventListener("click", (e) => {
            if (activeArticleId) {
                window.deleteArticleClick(activeArticleId, e);
            }
        });
    }

    // Initialize Share Overlay
    initShareOverlay();

    // Initialize Spotify-style text selection popup
    initTextSelectionPopup();

    // Settings Overlay Event Listeners

    const settingsOverlay = document.getElementById("settings-overlay");
    const closeSettingsBtn = document.getElementById("close-settings");
    const settingsThemeToggle = document.getElementById("settings-theme-toggle");
    const settingsSaveNameBtn = document.getElementById("settings-save-name-btn");
    const settingsBookmarksBtn = document.getElementById("settings-bookmarks-btn");
    const settingsLogoutBtn = document.getElementById("settings-logout-btn");

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", closeSettingsModal);
    }
    if (settingsOverlay) {
        settingsOverlay.addEventListener("click", (e) => {
            if (e.target === settingsOverlay) closeSettingsModal();
        });
    }

    // Profile Tab Switching Event Listeners
    const profileTabBtns = document.querySelectorAll(".profile-tab-btn");
    profileTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");
            window.switchProfileTab(tabName);
        });
    });

    // Theme toggle inside settings (synced with main theme button)
    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const newTheme = currentTheme === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("murekkep_theme", newTheme);
            // Sync icons on main theme button
            const sunIcon = document.querySelector(".icon-sun");
            const moonIcon = document.querySelector(".icon-moon");
            if (newTheme === "dark") {
                if (sunIcon) sunIcon.classList.remove("hidden");
                if (moonIcon) moonIcon.classList.add("hidden");
                settingsThemeToggle.classList.add("active");
            } else {
                if (sunIcon) sunIcon.classList.add("hidden");
                if (moonIcon) moonIcon.classList.remove("hidden");
                settingsThemeToggle.classList.remove("active");
            }
        });
    }

    // Username update
    if (settingsSaveNameBtn) {
        settingsSaveNameBtn.addEventListener("click", async () => {
            const input = document.getElementById("settings-username-input");
            if (!input || !currentUser) return;
            const newName = input.value.trim();
            if (!newName) return;

            const oldName = currentUser.username;
            await performUsernameMigration(oldName, newName);

            updateAuthUI();
            // Re-populate profile labels and stats
            renderProfileTabUI();

            showToast("✅ Kalem isminiz güncellendi!");
        });
    }

    // Go to bookmarks from settings
    if (settingsBookmarksBtn) {
        settingsBookmarksBtn.addEventListener("click", () => {
            closeSettingsModal();
            filterCategory("bookmarks");
        });
    }

    // Logout from settings
    if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener("click", () => {
            closeSettingsModal();
            signOutUser();
        });
    }

    // Editor Mode toggle switch in settings modal
    const settingsEditorToggle = document.getElementById("settings-editor-toggle");
    if (settingsEditorToggle) {
        settingsEditorToggle.addEventListener("click", () => {
            if (currentUser && currentUser.isEditor) {
                isEditorModeActive = !isEditorModeActive;
                updateEditorBannerUI();
                
                // Refresh active view to show/hide moderation controls
                if (currentCategoryFilter === "all") {
                    renderNewspaperGrid();
                } else {
                    renderCategoryFeed(currentCategoryFilter);
                }

                // Refresh active profile modal if open
                refreshOpenProfileModal();

                // Refresh reader overlay buttons if open
                if (activeArticleId) {
                    const approveBtn = document.getElementById("article-editor-approve-btn");
                    const deleteBtn = document.getElementById("article-editor-delete-btn");
                    if (approveBtn && deleteBtn) {
                        if (isEditorModeActive) {
                            approveBtn.classList.remove("hidden");
                            deleteBtn.classList.remove("hidden");
                        } else {
                            approveBtn.classList.add("hidden");
                            deleteBtn.classList.add("hidden");
                        }
                    }
                }
                
                showToast(isEditorModeActive ? "🛡️ Editör Modu Aktif" : "Editör Modu Kapatıldı");
            }
        });
    }

    // Article Report Button in reader overlay
    const articleReportBtn = document.getElementById("article-report-btn");
    if (articleReportBtn) {
        articleReportBtn.addEventListener("click", () => {
            if (activeArticleId) {
                window.reportArticleClick(activeArticleId);
            }
        });
    }
}

// =============================================
// GLOBAL MODERATION HELPER FUNCTIONS
// =============================================

window.reportArticleClick = function(id) {
    if (!currentUser) {
        openAuthModal();
        showToast("Şikayet etmek için lütfen giriş yapın.");
        return;
    }
    const reports = reportArticle(id);
    showToast("Yazı şikayet edildi. Katkınız için teşekkürler.");
    
    const reportBtn = document.getElementById("article-report-btn");
    if (reportBtn) reportBtn.classList.add("reported");
    
    // Refresh view
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
};

/** Helper: if the author profile modal is open for a given author, re-render it. */
function refreshOpenProfileModal() {
    const modal = document.getElementById('author-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    const currentName = document.getElementById('author-modal-name')?.innerText;
    if (currentName) {
        // Remember active tab
        const activeTabBtn = document.querySelector('#author-modal .profile-tab-btn.active');
        const activeTab = activeTabBtn ? activeTabBtn.dataset.authorTab : 'articles';
        window.openAuthorProfile(currentName, activeTab);
    }
}

window.approveArticleClick = function(id, event) {
    if (event) event.stopPropagation();
    resetArticleReports(id);
    showToast("✓ Yazı güvenli olarak onaylandı.");

    // Refresh main grid
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }

    // Refresh reading overlay report button if applicable
    if (activeArticleId === id) {
        const reportBtn = document.getElementById("article-report-btn");
        if (reportBtn) reportBtn.classList.remove("reported");
    }

    // Refresh profile modal if open
    refreshOpenProfileModal();
};

window.deleteArticleClick = function(id, event) {
    if (event) event.stopPropagation();

    // Find article author before removing
    const targetArt = articles.find(a => a.id === id);
    if (!targetArt) return;
    const deletedAuthor = targetArt.author;

    // Check permission: must be admin OR the author of this article
    const isOwnArticle = currentUser && currentUser.username &&
        currentUser.username.trim().toLowerCase() === deletedAuthor.trim().toLowerCase();

    if (!isEditorModeActive && !isOwnArticle) {
        showToast("✕ Bu işlemi yapmak için yetkiniz yok.");
        return;
    }

    if (!confirm("Bu yazıyı kalıcı olarak silmek istediğinizden emin misiniz?")) {
        return;
    }

    // Remove from local array
    articles = articles.filter(art => art.id !== id);

    if (isSupabaseConnected) {
        supabaseClient.from('articles').delete().eq('id', id).then(({ error }) => {
            if (error) console.error("Error deleting article from Supabase:", error);
        });
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
    }

    showToast("✕ Yazı silindi.");

    // Close reader overlay if deleted article was open
    if (activeArticleId === id) {
        closeArticle();
    }

    // Refresh main grid
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }

    // Refresh profile modal if open (article list count will update)
    refreshOpenProfileModal();
};

window.reportCommentClick = function(id, articleId, event) {
    if (event) event.stopPropagation();
    if (!currentUser) {
        openAuthModal();
        showToast("Şikayet etmek için lütfen giriş yapın.");
        return;
    }
    reportComment(id);
    showToast("Yorum şikayet edildi.");
    renderArticleComments(articleId);
};

window.approveCommentClick = function(id, articleId, event) {
    if (event) event.stopPropagation();
    resetCommentReports(id);
    showToast("Yorum onaylandı.");
    renderArticleComments(articleId);
};

window.deleteCommentClick = function(id, articleId, event) {
    if (event) event.stopPropagation();
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    const article = articles.find(a => a.id === articleId);
    
    const isOwnComment = currentUser && (
        comment.author === currentUser.username || 
        comment.author === (currentUser.email ? currentUser.email.split("@")[0] : "")
    );
    
    const isCommentOnOwnArticle = currentUser && article && article.author && (
        normalizeTurkishString(article.author) === normalizeTurkishString(currentUser.username)
    );
    
    const isAdminOrEditor = currentUser && currentUser.isEditor;
    
    if (!isOwnComment && !isCommentOnOwnArticle && !isAdminOrEditor) {
        showToast("✕ Bu yorumu silme yetkiniz bulunmamaktadır.");
        return;
    }
    
    comments = comments.filter(c => c.id !== id);
    
    if (isSupabaseConnected) {
        supabaseClient.from('comments').delete().eq('id', id).then(({ error }) => {
            if (error) console.error("Error deleting comment from Supabase:", error);
        });
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
    }
    
    showToast("Yorum silindi.");
    renderArticleComments(articleId);
};


// =============================================
// LITERARY JOURNEY (YAZAR SERÜVENİ) SYSTEM
// =============================================

// Helper: Get Pen Rank based on stats
// Helper: Get Pen Rank based on stats
function getPenRank(totalArticles, totalClaps) {
    const xp = (totalArticles * 50) + (totalClaps * 5);
    const ranks = [
        {
            id: 'drop',
            label: 'Mürekkep Damlası',
            icon: '💧',
            color: '#3498db',
            bgColor: 'rgba(52, 152, 219, 0.08)',
            borderColor: 'rgba(52, 152, 219, 0.2)',
            description: 'Edebiyat dünyasına yeni adım atmış taze bir damla.',
            reqXp: 0,
            reqArticles: 0,
            reqClaps: 0
        },
        {
            id: 'young',
            label: 'Genç Kalem',
            icon: '✒️',
            color: '#2ecc71',
            bgColor: 'rgba(46, 204, 113, 0.08)',
            borderColor: 'rgba(46, 204, 113, 0.2)',
            description: 'İlk eserini vererek kalemini yeşerten hevesli yazar.',
            reqXp: 150,
            reqArticles: 1,
            reqClaps: 10
        },
        {
            id: 'expert',
            label: 'Usta Kalem',
            icon: '🖋️',
            color: '#e67e22',
            bgColor: 'rgba(230, 126, 34, 0.08)',
            borderColor: 'rgba(230, 126, 34, 0.2)',
            description: 'Usta işi yazılarıyla kalitesini kanıtlamış güçlü yazar.',
            reqXp: 800,
            reqArticles: 4,
            reqClaps: 200
        },
        {
            id: 'author',
            label: 'Müellif',
            icon: '📖',
            color: '#9b59b6',
            bgColor: 'rgba(155, 89, 182, 0.08)',
            borderColor: 'rgba(155, 89, 182, 0.2)',
            description: 'Eserleriyle kendi okuyucu kitlesini oluşturmuş üretken müellif.',
            reqXp: 2000,
            reqArticles: 8,
            reqClaps: 800
        },
        {
            id: 'columnist',
            label: 'Köşe Yazarı',
            icon: '📰',
            color: '#1abc9c',
            bgColor: 'rgba(26, 188, 156, 0.08)',
            borderColor: 'rgba(26, 188, 156, 0.2)',
            description: 'Köşe yazılarıyla gazetenin vazgeçilmez seslerinden biri haline gelmiş yazar.',
            reqXp: 4500,
            reqArticles: 15,
            reqClaps: 2250
        },
        {
            id: 'chief',
            label: 'Başyazar',
            icon: '🏛️',
            color: '#e74c3c',
            bgColor: 'rgba(231, 76, 60, 0.08)',
            borderColor: 'rgba(231, 76, 60, 0.2)',
            description: 'Fikirleri ve engin tecrübesiyle yazı kuruluna yön veren başyazar.',
            reqXp: 8500,
            reqArticles: 25,
            reqClaps: 4750
        },
        {
            id: 'literary_master',
            label: 'Edebiyat Ustası',
            icon: '👑',
            color: '#f1c40f',
            bgColor: 'rgba(241, 196, 15, 0.08)',
            borderColor: 'rgba(241, 196, 15, 0.2)',
            description: 'Eserleri klasikleşmeye başlamış, üslup sahibi edebiyat ustası.',
            reqXp: 15000,
            reqArticles: 40,
            reqClaps: 9000
        },
        {
            id: 'legend',
            label: 'Mürekkep Efsanesi',
            icon: '🌟',
            color: '#f39c12',
            bgColor: 'rgba(243, 156, 18, 0.08)',
            borderColor: 'rgba(243, 156, 18, 0.2)',
            description: 'Yazıları nesiller boyu okunacak, Mürekkep tarihine altın harflerle yazılmış efsane.',
            reqXp: 30000,
            reqArticles: 60,
            reqClaps: 21000
        }
    ];

    let currentRank = ranks[0];
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].reqXp) {
            currentRank = ranks[i];
            break;
        }
    }
    
    // Find next rank for progress calculation
    const currentIdx = ranks.findIndex(r => r.id === currentRank.id);
    const nextRank = currentIdx < ranks.length - 1 ? ranks[currentIdx + 1] : null;

    return {
        ...currentRank,
        xp: xp,
        nextRank: nextRank
    };
}

// ─── Profile Storage & Helpers ──────────────────────────────────────────────

// Helper: Get customized profile data for an author
function getAuthorProfileData(authorName) {
    const defaultProfile = {
        bio: "",
        socialInstagram: "",
        socialTwitter: "",
        socialWeb: "",
        avatarType: "gradient",
        avatarVal: "linear-gradient(135deg, var(--accent-color), #d35400)",
        coverVal: "linear-gradient(135deg, var(--accent-color), #2b1111)"
    };
    
    if (!authorName) return defaultProfile;
    const key = authorName.toLowerCase().trim();
    
    // Default initial avatar gradient based on author name hash to keep it colorful
    let defaultGradient = "linear-gradient(135deg, var(--accent-color), #d35400)";
    const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const presets = [
        "linear-gradient(135deg, #5d1a1a, #c94040)",
        "linear-gradient(135deg, #134e5e, #71b280)",
        "linear-gradient(135deg, #0f2027, #2c5364)",
        "linear-gradient(135deg, #e65c00, #F9D423)",
        "linear-gradient(135deg, #6c5ce7, #a29bfe)",
        "linear-gradient(135deg, #d35400, #e67e22)",
        "linear-gradient(135deg, #27ae60, #2ecc71)"
    ];
    defaultGradient = presets[hash % presets.length];

    defaultProfile.avatarVal = defaultGradient;

    return {
        ...defaultProfile,
        ...(authorProfiles[key] || {})
    };
}

// Helper: Save customized profile data for an author
function saveAuthorProfileData(authorName, data) {
    if (!authorName) return;
    const key = authorName.toLowerCase().trim();
    
    authorProfiles[key] = {
        ...(authorProfiles[key] || {}),
        ...data
    };
    
    saveAuthorProfiles();
}

// Helper: Get HTML representation for an author's avatar
function getAuthorAvatarHtml(authorName, size = 32) {
    const profile = getAuthorProfileData(authorName);
    const initial = (authorName || "?").substring(0, 1).toUpperCase();
    const styleString = `width:${size}px; height:${size}px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; font-family:var(--font-header); font-weight:800; font-size:${size * 0.45}px; border:1px solid var(--border-color); box-shadow:var(--shadow-sm); overflow:hidden; vertical-align:middle; text-shadow: 0 1px 2px rgba(0,0,0,0.2);`;

    if (profile.avatarType === "image" && profile.avatarVal) {
        return `<div class="author-custom-avatar-container" style="${styleString} background-image:url('${profile.avatarVal}'); background-size:cover; background-position:center;" title="${authorName}"></div>`;
    } else if (profile.avatarType === "emoji" && profile.avatarVal) {
        return `<div class="author-custom-avatar-container" style="${styleString} background:var(--bg-secondary); border-color:var(--border-light);" title="${authorName}">${profile.avatarVal}</div>`;
    } else {
        // gradient
        const bg = profile.avatarVal || "linear-gradient(135deg, var(--accent-color), #d35400)";
        return `<div class="author-custom-avatar-container" style="${styleString} background:${bg}; color:#ffffff;" title="${authorName}">${initial}</div>`;
    }
}

function normalizeTurkishString(str) {
    if (!str) return "";
    return str.trim()
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ç/g, 'c')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u');
}

// Helper: Get stats and rank for an author
function getAuthorStats(authorName) {
    if (!authorName) return { totalArticles: 0, totalClaps: 0, totalReadTime: 0, rank: getPenRank(0, 0) };
    
    const nameNorm = normalizeTurkishString(authorName);
    const authorArticles = articles.filter(a => a.author && normalizeTurkishString(a.author) === nameNorm);
    
    const totalArticles = authorArticles.length;
    const totalClaps = authorArticles.reduce((sum, a) => sum + (parseInt(a.claps) || 0), 0);
    
    const totalReadTime = authorArticles.reduce((sum, a) => {
        const matches = (a.readTime || '').match(/\d+/);
        return sum + (matches ? parseInt(matches[0]) : 3);
    }, 0);

    const rank = getPenRank(totalArticles, totalClaps);

    return {
        totalArticles,
        totalClaps,
        totalReadTime,
        rank
    };
}

// Helper: Get HTML string for an author's rank badge
function getAuthorRankBadgeHtml(authorName) {
    if (!authorName) return "";
    const norm = normalizeTurkishString(authorName);
    if (norm === "murekkep editoru" || norm === "mürekkep editörü" || norm === "editor" || norm === "editör" || norm === "murekkep yayin kurulu" || norm === "mürekkep yayın kurulu" || norm === "admin") {
        return "";
    }
    const stats = getAuthorStats(authorName);
    const rank = stats.rank;
    return `
        <span class="author-rank-badge" style="background:${rank.bgColor}; color:${rank.color}; border: 1px solid ${rank.borderColor}; font-size:0.58rem; padding: 1px 6px; border-radius: 4px; font-weight:700; margin-left:6px; letter-spacing:0.3px; text-transform:uppercase; font-family:var(--font-ui); display:inline-flex; align-items:center; gap:3px; cursor:help; vertical-align: middle;" title="${rank.description}">
            ${rank.icon} ${rank.label}
        </span>
    `;
}

// ─── Tabbed Author / Profile Modal ─────────────────────────────────────────

/** Switch a tab inside the author/profile modal */
function switchAuthorModalTab(tabId) {
    const panels = ['articles','followers','following'];
    panels.forEach(p => {
        const panel = document.getElementById(`author-panel-${p}`);
        const btn   = document.getElementById(`author-tab-${p}`);
        if (!panel || !btn) return;
        if (p === tabId) {
            panel.classList.remove('hidden');
            btn.classList.add('active');
        } else {
            panel.classList.add('hidden');
            btn.classList.remove('active');
        }
    });
}

/** Build a person-card element and return it */
function buildPersonCard(name, subText, onClickFn) {
    const card = document.createElement('div');
    card.className = 'person-card';
    const av = document.createElement('div');
    av.className = 'person-card-avatar';
    av.textContent = name.substring(0,1).toUpperCase();
    const info = document.createElement('div');
    info.innerHTML = `<div class="person-card-name">${name}</div><div class="person-card-sub">${subText}</div>`;
    card.appendChild(av);
    card.appendChild(info);
    card.addEventListener('click', onClickFn);
    return card;
}

/** Open / refresh the profile modal for the given author name.
 *  If authorName equals the logged-in user, it renders in "own profile" mode. */
window.openAuthorProfile = function(authorName, startTab) {
    if (!authorName) return;
    const modal = document.getElementById('author-modal');
    if (!modal) return;

    const isOwnProfile = currentUser && currentUser.username &&
        currentUser.username.trim().toLowerCase() === authorName.trim().toLowerCase();

    const stats = getAuthorStats(authorName);
    const authorArticles = articles
        .filter(a => a.author && a.author.trim().toLowerCase() === authorName.trim().toLowerCase())
        .reverse();

    // ── Read follow data ────────────────────────────────────────────────────
    let followersData = {};
    try { followersData = JSON.parse(localStorage.getItem('murekkep_author_followers') || '{}'); } catch(e){}

    // followersList: array of user-IDs who follow authorName
    const followersList = followersData[authorName] || [];

    // followingNames: array of author names that the current user (if own profile) follows
    let followingNames = [];
    if (isOwnProfile && currentUser) {
        followingNames = Object.keys(followersData).filter(name =>
            followersData[name] && followersData[name].some(f => {
                if (typeof f === 'string') return f === currentUser.id;
                return f && f.id === currentUser.id;
            })
        );
    }

    // ── Load Custom Profile details ──────────────────────────────────────────
    const profile = getAuthorProfileData(authorName);

    // Apply Cover
    const coverEl = document.getElementById('author-modal-cover');
    if (coverEl) coverEl.style.background = profile.coverVal || "linear-gradient(135deg, var(--accent-color), #2b1111)";

    // Apply Avatar
    const avatarEl = document.getElementById('author-modal-avatar');
    if (avatarEl) {
        avatarEl.style.backgroundImage = "";
        avatarEl.style.background = "";
        avatarEl.textContent = "";
        
        if (profile.avatarType === 'image' && profile.avatarVal) {
            avatarEl.style.backgroundImage = `url('${profile.avatarVal}')`;
            avatarEl.style.backgroundSize = "cover";
            avatarEl.style.backgroundPosition = "center";
        } else if (profile.avatarType === 'emoji' && profile.avatarVal) {
            avatarEl.textContent = profile.avatarVal;
            avatarEl.style.background = "var(--bg-secondary)";
        } else {
            avatarEl.textContent = authorName.substring(0,1).toUpperCase();
            avatarEl.style.background = profile.avatarVal || "linear-gradient(135deg, var(--accent-color), #d35400)";
        }
    }

    // ── Header info ──────────────────────────────────────────────────────────
    document.getElementById('author-modal-name').innerText = authorName;

    const badgePlaceholder = document.getElementById('author-modal-badge-placeholder');
    if (badgePlaceholder) badgePlaceholder.innerHTML = getAuthorRankBadgeHtml(authorName);

    // Apply Biography
    const bioEl = document.getElementById('author-modal-bio');
    const bioTrigger = document.getElementById('author-modal-bio-edit-trigger');
    if (bioEl) {
        bioEl.innerHTML = "";
        if (profile.bio) {
            bioEl.innerText = profile.bio;
            bioEl.classList.remove('profile-bio-empty');
        } else {
            bioEl.innerText = isOwnProfile ? "Kendinizden bahsedin... (Biyografinizi yazmak için düzenle butonuna tıklayın.)" : "Bu yazar henüz bir biyografi eklememiş.";
            bioEl.classList.add('profile-bio-empty');
        }
    }
    if (bioTrigger) {
        bioTrigger.innerText = "✍️ Biyografiyi Düzenle";
        bioTrigger.removeAttribute('data-editing');
    }

    // Apply Social Links
    const socialsEl = document.getElementById('author-modal-socials');
    if (socialsEl) {
        socialsEl.innerHTML = "";
        
        // Instagram
        if (profile.socialInstagram) {
            socialsEl.innerHTML += `
                <a href="https://instagram.com/${profile.socialInstagram}" target="_blank" class="profile-social-btn" title="Instagram: @${profile.socialInstagram}">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>`;
        } else if (isOwnProfile) {
            socialsEl.innerHTML += `
                <a href="javascript:void(0)" onclick="openPopoverNear(this, 'socials')" class="profile-social-btn" style="opacity: 0.5;" title="Instagram Hesabı Ekle">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>`;
        }

        // Twitter / X
        if (profile.socialTwitter) {
            socialsEl.innerHTML += `
                <a href="https://twitter.com/${profile.socialTwitter}" target="_blank" class="profile-social-btn" title="Twitter/X: @${profile.socialTwitter}">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>`;
        } else if (isOwnProfile) {
            socialsEl.innerHTML += `
                <a href="javascript:void(0)" onclick="openPopoverNear(this, 'socials')" class="profile-social-btn" style="opacity: 0.5;" title="Twitter/X Hesabı Ekle">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>`;
        }

        // Website
        if (profile.socialWeb) {
            socialsEl.innerHTML += `
                <a href="${profile.socialWeb}" target="_blank" class="profile-social-btn" title="Kişisel Web Sitesi: ${profile.socialWeb}">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </a>`;
        } else if (isOwnProfile) {
            socialsEl.innerHTML += `
                <a href="javascript:void(0)" onclick="openPopoverNear(this, 'socials')" class="profile-social-btn" style="opacity: 0.5;" title="Kişisel Web Sitesi Ekle">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </a>`;
        }
    }

    // ── Setup Role based views and edit triggers ────────────────────────────
    const renameTrigger = document.getElementById('author-modal-name-edit-trigger');
    const editCoverBtn = document.getElementById('profile-edit-cover-btn');
    const avatarWrapper = document.getElementById('profile-avatar-wrapper-el');
    const dashboardCard = document.getElementById('author-modal-studio-dashboard');
    const statsRow = document.getElementById('author-modal-stats-row');

    if (isOwnProfile) {
        if (renameTrigger) renameTrigger.classList.remove('hidden');
        if (bioTrigger) bioTrigger.classList.remove('hidden');
        if (editCoverBtn) editCoverBtn.classList.remove('hidden');
        if (avatarWrapper) avatarWrapper.classList.add('profile-avatar-editable');
        if (dashboardCard) {
            dashboardCard.classList.remove('hidden');
            syncDashboardInProfile();
        }
        if (statsRow) statsRow.classList.add('hidden');
    } else {
        if (renameTrigger) renameTrigger.classList.add('hidden');
        if (bioTrigger) bioTrigger.classList.add('hidden');
        if (editCoverBtn) editCoverBtn.classList.add('hidden');
        if (avatarWrapper) avatarWrapper.classList.remove('profile-avatar-editable');
        if (dashboardCard) dashboardCard.classList.add('hidden');
        if (statsRow) {
            statsRow.classList.remove('hidden');
            document.getElementById('author-modal-stat-articles').innerText  = stats.totalArticles;
            document.getElementById('author-modal-stat-followers').innerText = followersList.length;
            document.getElementById('author-modal-stat-following').innerText = '—';
        }
    }

    // Make stat boxes clickable → jump to tab (only in public view)
    const statBoxArticles  = document.getElementById('author-modal-stat-box-articles');
    const statBoxFollowers = document.getElementById('author-modal-stat-box-followers');
    const statBoxFollowing = document.getElementById('author-modal-stat-box-following');
    const cloneAndBind = (el, tabId) => {
        if (!el) return el;
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        clone.addEventListener('click', () => switchAuthorModalTab(tabId));
        return clone;
    };
    cloneAndBind(statBoxArticles,  'articles');
    cloneAndBind(statBoxFollowers, 'followers');
    if (!isOwnProfile) cloneAndBind(statBoxFollowing, 'following');

    // ── Follow button ──────────────────────────────────────────────────────
    const followBtnEl = document.getElementById('author-modal-follow-btn');
    if (followBtnEl) {
        if (isOwnProfile) {
            followBtnEl.style.display = 'none';
        } else {
            followBtnEl.style.display = '';
            const newBtn = followBtnEl.cloneNode(true);
            followBtnEl.parentNode.replaceChild(newBtn, followBtnEl);
            const isFollowing = currentUser && followersList.some(f => {
                if (typeof f === 'string') return f === currentUser.id;
                return f && f.id === currentUser.id;
            });
            if (isFollowing) {
                newBtn.textContent = '✓ Takip Ediliyor';
                newBtn.style.cssText = 'background:transparent;color:var(--text-primary);border:1px solid var(--border-color);padding:7px 22px;border-radius:20px;font-family:var(--font-ui);font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;';
            } else {
                newBtn.textContent = 'Takip Et';
                newBtn.style.cssText = 'background:var(--accent-color);color:#fff;border:none;padding:7px 22px;border-radius:20px;font-family:var(--font-ui);font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;box-shadow:var(--shadow-sm);';
            }
            newBtn.addEventListener('click', () => window.toggleFollowAuthor(authorName));
        }
    }

    // ── Tab: Articles ──────────────────────────────────────────────────────
    const articlesContainer = document.getElementById('author-modal-articles-list');
    if (articlesContainer) {
        articlesContainer.innerHTML = '';
        if (authorArticles.length === 0) {
            articlesContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Henüz yayınlanmış eser bulunmuyor.</p>`;
        } else {
            authorArticles.forEach(art => {
                const reports = getArticleReports(art.id);
                const isFlagged = reports > 0 && isEditorModeActive;

                const item = document.createElement('div');
                item.style.cssText = `background:var(--bg-secondary);border:1px solid ${isFlagged ? '#c0392b' : 'var(--border-light)'};padding:14px;border-radius:10px;transition:all 0.18s;position:relative;`;
                item.className = 'author-article-item';

                // Flag badge for editor mode
                const flagBadge = isFlagged
                    ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#c0392b;color:#fff;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:6px;">⚠️ Şikayet: ${reports}</div>`
                    : '';

                // Editor/Owner action buttons
                let editorControls = '';
                if (isEditorModeActive) {
                    editorControls = `
                        <div class="profile-editor-controls" onclick="event.stopPropagation();">
                            <button class="btn-editor-action approve" onclick="window.approveArticleClick('${art.id}', event)">✓ Onayla</button>
                            <button class="btn-editor-action delete" onclick="window.deleteArticleClick('${art.id}', event)">✕ Kaldır</button>
                        </div>`;
                } else if (isOwnProfile) {
                    editorControls = `
                        <div class="profile-editor-controls" onclick="event.stopPropagation();" style="display:flex; justify-content:flex-end; margin-top:8px;">
                            <button class="btn-editor-action delete" style="background:#e53935; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-family:var(--font-ui); font-size:0.68rem; font-weight:700; cursor:pointer;" onclick="window.deleteArticleClick('${art.id}', event)">✕ Yazıyı Sil</button>
                        </div>`;
                }

                item.innerHTML = `
                    ${flagBadge}
                    <div style="font-size:0.68rem;font-weight:700;color:var(--accent-color);text-transform:uppercase;margin-bottom:5px;letter-spacing:0.4px;">${art.category.replace('-',' ')}</div>
                    <h4 style="font-family:var(--font-header);font-size:1.05rem;font-weight:800;margin-bottom:4px;color:var(--text-primary);line-height:1.25;">${art.title}</h4>
                    <p style="font-size:0.76rem;color:var(--text-secondary);line-height:1.4;margin-bottom:8px;">${art.subtitle}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.65rem;color:var(--text-secondary);">
                        <span>${art.date}</span><span>👏 ${art.claps}</span>
                    </div>
                    ${editorControls}`;

                // Clicking on the card body opens the article (but not on editor controls)
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.profile-editor-controls')) return;
                    modal.classList.add('hidden');
                    unlockBodyScroll();
                    openArticle(art.id);
                });
                articlesContainer.appendChild(item);
            });
        }
    }

    // ── Tab: Followers ─────────────────────────────────────────────────────
    const followersContainer = document.getElementById('author-modal-followers-list');
    if (followersContainer) {
        followersContainer.innerHTML = '';
        if (followersList.length === 0) {
            followersContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Henüz takipçi yok.</p>`;
        } else {
            followersList.forEach(f => {
                let displayName = "";
                let openTarget = "";
                if (typeof f === 'string') {
                    displayName = f;
                    openTarget = f;
                } else if (f && typeof f === 'object') {
                    displayName = f.username || f.id;
                    openTarget = f.username || f.id;
                }
                const card = buildPersonCard(displayName, 'Takipçi', () => {
                    window.openAuthorProfile(openTarget);
                });
                followersContainer.appendChild(card);
            });
        }
    }

    // ── Tab: Following (own profile only) ─────────────────────────────────
    const followingContainer = document.getElementById('author-modal-following-list');
    if (followingContainer) {
        followingContainer.innerHTML = '';
        if (!isOwnProfile) {
            followingContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Bu bilgi yalnızca profil sahibine gösterilir.</p>`;
        } else if (followingNames.length === 0) {
            followingContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Henüz kimseyi takip etmiyorsun.</p>`;
        } else {
            followingNames.forEach(name => {
                const nameStats = getAuthorStats(name);
                const card = buildPersonCard(name, `${nameStats.totalArticles} Eser`, () => {
                    window.openAuthorProfile(name);
                });
                followingContainer.appendChild(card);
            });
        }
    }

    // ── Tab nav event wiring ───────────────────────────────────────────────
    ['articles','followers','following'].forEach(tabId => {
        const btn = document.getElementById(`author-tab-${tabId}`);
        if (!btn) return;
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', () => switchAuthorModalTab(tabId));
    });

    // Restore to requested tab (default: articles)
    switchAuthorModalTab(startTab || 'articles');

    // Show modal
    modal.classList.remove('hidden');
    lockBodyScroll();
};

// Dynamic Dashboard Sync in Profile Modal
function syncDashboardInProfile() {
    if (!currentUser) return;
    const statsWriter = getAuthorStats(currentUser.username);
    
    const rankIcon = document.getElementById("author-modal-rank-icon");
    const rankName = document.getElementById("author-modal-rank-name");
    const rankDesc = document.getElementById("author-modal-rank-desc");
    
    const isEditor = (currentUser.isEditor || (currentUser.username && (normalizeTurkishString(currentUser.username) === "murekkep editoru" || normalizeTurkishString(currentUser.username) === "editor" || normalizeTurkishString(normalizeTurkishString(currentUser.username)) === "editör")));
    const rankDetailsBox = document.getElementById("author-modal-rank-details-box");
    const rankProgressBox = document.getElementById("author-modal-rank-progress-box");

    if (isEditor) {
        if (rankDetailsBox) rankDetailsBox.style.display = "none";
        if (rankProgressBox) rankProgressBox.style.display = "none";
    } else {
        if (rankDetailsBox) rankDetailsBox.style.display = "flex";
        if (rankProgressBox) rankProgressBox.style.display = "block";

        if (rankIcon) rankIcon.innerText = statsWriter.rank.icon;
        if (rankName) rankName.innerText = statsWriter.rank.label;
        if (rankDesc) rankDesc.innerText = statsWriter.rank.description;

        // Rank Progress Bar
        const progressLabel = document.getElementById("author-modal-progress-label");
        const progressPct = document.getElementById("author-modal-progress-pct");
        const progressBar = document.getElementById("author-modal-progress-bar");
        const progressDetails = document.getElementById("author-modal-progress-details");

        const currentRank = statsWriter.rank;
        const nextRank = currentRank.nextRank;

        if (nextRank) {
            if (progressLabel) progressLabel.innerText = `Sonraki Derece: ${nextRank.label}`;
            
            const xpCurrent = statsWriter.rank.xp;
            const xpNext = nextRank.reqXp;
            const xpPrev = currentRank.reqXp;
            
            const earnedXp = xpCurrent - xpPrev;
            const neededXp = xpNext - xpPrev;
            const progressVal = Math.min(100, Math.max(0, Math.round((earnedXp / neededXp) * 100)));
            
            if (progressPct) progressPct.innerText = `${progressVal}%`;
            if (progressBar) progressBar.style.width = `${progressVal}%`;
            if (progressDetails) progressDetails.innerText = `Edebi Puan (XP): ${xpCurrent} / ${xpNext} XP`;
        } else {
            if (progressLabel) progressLabel.innerText = "Derece Serüveni Tamamlandı! En yüksek rütbedesiniz.";
            if (progressPct) progressPct.innerText = "100%";
            if (progressBar) progressBar.style.width = "100%";
            if (progressDetails) progressDetails.innerText = `Toplam Edebi Puan (XP): ${currentRank.xp} XP`;
        }
    }

    // Weekly Goal Progress
    const goalVal = localStorage.getItem(`murekkep_writer_goal_${currentUser.id}`) || "1";
    
    // Calculate published count in last 7 days
    const last7Days = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const ownArticles = articles.filter(a => a.author && a.author.trim().toLowerCase() === currentUser.username.trim().toLowerCase());
    
    let publishedCount = 0;
    ownArticles.forEach(a => {
        let artDate = new Date();
        try {
            artDate = new Date(a.date);
            if (isNaN(artDate.getTime())) {
                artDate = new Date(); // fallback
            }
        } catch(e) {}
        
        if (now - artDate <= last7Days) {
            publishedCount++;
        }
    });

    const goalPct = Math.min((publishedCount / parseInt(goalVal)) * 100, 100);
    const goalStatusEl = document.getElementById("author-modal-goal-status");
    const goalBarEl = document.getElementById("author-modal-goal-bar");
    
    if (goalStatusEl) goalStatusEl.innerText = `${publishedCount} / ${goalVal} Eser`;
    if (goalBarEl) goalBarEl.style.width = `${goalPct}%`;

    // Streak & Read Time
    const streakKey = `murekkep_writer_streak_${currentUser.id}`;
    let streak = parseInt(localStorage.getItem(streakKey) || "0");
    const streakEl = document.getElementById("author-modal-streak-val");
    if (streakEl) streakEl.innerText = streak;

    const readtimeEl = document.getElementById("author-modal-stat-readtime-val");
    if (readtimeEl) readtimeEl.innerText = `${statsWriter.totalReadTime} dk`;
}

// Global state variables for customizations
let selectedAvatarGradient = "";
let selectedAvatarEmoji = "✍️";
let selectedCoverVal = "";

// Initialize Profile Customize Popover Event Handlers
function initProfileCustomizer() {
    const popover = document.getElementById('profile-editor-popover');
    const closeBtn = document.getElementById('close-profile-popover');
    
    // Popover Close click
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popover.classList.add('hidden');
        });
    }

    // Tab buttons event listeners
    const popTabBtns = document.querySelectorAll('.profile-popover-tab-btn');
    popTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            popTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle panels
            const panels = document.querySelectorAll('.popover-panel');
            panels.forEach(p => p.classList.add('hidden'));
            
            if (btn.id === 'popover-tab-avatar-btn') {
                document.getElementById('popover-panel-avatar').classList.remove('hidden');
            } else if (btn.id === 'popover-tab-cover-btn') {
                document.getElementById('popover-panel-cover').classList.remove('hidden');
            } else if (btn.id === 'popover-tab-socials-btn') {
                document.getElementById('popover-panel-socials').classList.remove('hidden');
            }
        });
    });

    // Avatar Type dropdown change
    const avatarTypeSelect = document.getElementById('avatar-type-select');
    if (avatarTypeSelect) {
        avatarTypeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('avatar-sub-gradient').classList.add('hidden');
            document.getElementById('avatar-sub-emoji').classList.add('hidden');
            document.getElementById('avatar-sub-image').classList.add('hidden');
            
            if (val === 'gradient') {
                document.getElementById('avatar-sub-gradient').classList.remove('hidden');
            } else if (val === 'emoji') {
                document.getElementById('avatar-sub-emoji').classList.remove('hidden');
            } else if (val === 'image') {
                document.getElementById('avatar-sub-image').classList.remove('hidden');
            }
        });
    }

    // Preset Gradient select clicks
    const gradCards = document.querySelectorAll('#avatar-sub-gradient .preset-card');
    gradCards.forEach(card => {
        card.addEventListener('click', () => {
            gradCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedAvatarGradient = card.getAttribute('data-gradient');
        });
    });

    // Preset Emoji select clicks
    const emojiCircles = document.querySelectorAll('.preset-emoji-circle');
    emojiCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            emojiCircles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            selectedAvatarEmoji = circle.getAttribute('data-emoji');
        });
    });

    // Preset Cover select clicks
    const coverCards = document.querySelectorAll('#popover-panel-cover .preset-card');
    coverCards.forEach(card => {
        card.addEventListener('click', () => {
            coverCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedCoverVal = card.getAttribute('data-cover');
        });
    });

    // Save profile customizations popover
    const saveCustomBtn = document.getElementById('save-profile-customizations');
    if (saveCustomBtn) {
        saveCustomBtn.addEventListener('click', () => {
            if (!currentUser) return;
            const authorName = currentUser.username || currentUser.email.split("@")[0];
            const type = avatarTypeSelect.value;
            
            let val = "";
            if (type === 'gradient') {
                val = selectedAvatarGradient || "linear-gradient(135deg, var(--accent-color), #d35400)";
            } else if (type === 'emoji') {
                val = selectedAvatarEmoji || "✍️";
            } else if (type === 'image') {
                val = document.getElementById('avatar-image-url-input').value.trim() || "";
            }
            
            saveAuthorProfileData(authorName, {
                avatarType: type,
                avatarVal: val,
                coverVal: selectedCoverVal || "linear-gradient(135deg, var(--accent-color), #2b1111)",
                socialInstagram: document.getElementById('social-instagram-input').value.trim(),
                socialTwitter: document.getElementById('social-twitter-input').value.trim(),
                socialWeb: document.getElementById('social-web-input').value.trim()
            });

            // Close popover
            popover.classList.add('hidden');
            showToast("✨ Profil görünümünüz başarıyla güncellendi!");
            
            // Reload views
            window.openAuthorProfile(authorName);
            updateAuthUI();
        });
    }

    // Cover edit button handler inside profile modal → opens popover near edit button
    const editCoverBtn = document.getElementById('profile-edit-cover-btn');
    if (editCoverBtn) {
        editCoverBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopoverNear(editCoverBtn, 'cover');
        });
    }

    // Avatar wrapper click handler inside profile modal
    const avatarWrapper = document.getElementById('profile-avatar-wrapper-el');
    if (avatarWrapper) {
        avatarWrapper.addEventListener('click', (e) => {
            if (avatarWrapper.classList.contains('profile-avatar-editable')) {
                e.stopPropagation();
                openPopoverNear(avatarWrapper, 'avatar');
            }
        });
    }

    // Inline rename edit button
    const renameTrigger = document.getElementById('author-modal-name-edit-trigger');
    if (renameTrigger) {
        renameTrigger.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            
            const currentName = currentUser.username || currentUser.email.split("@")[0];
            
            // Prompt styling or beautiful replacement
            const newNameInput = prompt("Yeni kalem isminizi (yazar adınızı) girin:", currentName);
            if (newNameInput === null) return;
            const newName = newNameInput.trim();
            if (!newName || newName === currentName) return;

            const oldName = currentUser.username;
            await performUsernameMigration(oldName, newName);

            updateAuthUI();
            window.openAuthorProfile(newName);
            showToast("✅ Kalem isminiz başarıyla güncellendi!");
        });
    }

    // Inline Biography editing
    const bioTrigger = document.getElementById('author-modal-bio-edit-trigger');
    const bioTextEl = document.getElementById('author-modal-bio');
    if (bioTrigger && bioTextEl) {
        bioTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            const authorName = currentUser.username || currentUser.email.split("@")[0];
            const profile = getAuthorProfileData(authorName);

            // Turn bioTextEl into an editor
            if (bioTrigger.getAttribute('data-editing') === 'true') {
                // Save Bio
                const textarea = bioTextEl.querySelector('textarea');
                if (textarea) {
                    const newBio = textarea.value.trim();
                    saveAuthorProfileData(authorName, { bio: newBio });
                    bioTextEl.innerHTML = "";
                    bioTextEl.innerText = newBio || "Kendinizden bahsedin...";
                    if (!newBio) bioTextEl.classList.add('profile-bio-empty'); else bioTextEl.classList.remove('profile-bio-empty');
                    
                    bioTrigger.innerText = "✍️ Biyografiyi Düzenle";
                    bioTrigger.removeAttribute('data-editing');
                    showToast("✅ Biyografiniz başarıyla güncellendi!");
                }
            } else {
                // Open Editor
                const currentBio = profile.bio || "";
                bioTextEl.innerHTML = `<textarea class="form-control profile-bio-edit-area" rows="3" style="width:100%; border-radius:8px; padding:10px; margin-top:5px; font-family:var(--font-body); font-size:0.92rem; background:var(--bg-secondary); border:1px solid var(--border-color); color:var(--text-primary); resize:vertical;" placeholder="Kendinizden bahsedin...">${currentBio}</textarea>`;
                const textarea = bioTextEl.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    // Prevent closing overlay on clicking inside textarea
                    textarea.addEventListener('click', (ev) => ev.stopPropagation());
                }
                bioTrigger.innerText = "💾 Biyografiyi Kaydet";
                bioTrigger.setAttribute('data-editing', 'true');
            }
        });
    }

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (popover && !popover.classList.contains('hidden')) {
            if (!popover.contains(e.target) && 
                !e.target.closest('#profile-edit-cover-btn') && 
                !e.target.closest('#profile-avatar-wrapper-el')) {
                popover.classList.add('hidden');
            }
        }
    });
}

// Position and open popover helper
function openPopoverNear(element, defaultTab = 'avatar') {
    const popover = document.getElementById('profile-editor-popover');
    if (!popover || !currentUser) return;
    
    const authorName = currentUser.username || currentUser.email.split("@")[0];
    const profile = getAuthorProfileData(authorName);

    // Set initial values from profile
    const avatarTypeSelect = document.getElementById('avatar-type-select');
    if (avatarTypeSelect) avatarTypeSelect.value = profile.avatarType;
    
    // Toggle sub-panels correctly
    document.getElementById('avatar-sub-gradient').classList.add('hidden');
    document.getElementById('avatar-sub-emoji').classList.add('hidden');
    document.getElementById('avatar-sub-image').classList.add('hidden');
    
    if (profile.avatarType === 'gradient') {
        document.getElementById('avatar-sub-gradient').classList.remove('hidden');
        // Highlight active gradient preset card
        const presetCards = document.querySelectorAll('#avatar-sub-gradient .preset-card');
        presetCards.forEach(c => {
            if (c.getAttribute('data-gradient') === profile.avatarVal) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });
        selectedAvatarGradient = profile.avatarVal;
    } else if (profile.avatarType === 'emoji') {
        document.getElementById('avatar-sub-emoji').classList.remove('hidden');
        const emojiCircles = document.querySelectorAll('.preset-emoji-circle');
        emojiCircles.forEach(c => {
            if (c.getAttribute('data-emoji') === profile.avatarVal) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });
        selectedAvatarEmoji = profile.avatarVal;
    } else if (profile.avatarType === 'image') {
        document.getElementById('avatar-sub-image').classList.remove('hidden');
        document.getElementById('avatar-image-url-input').value = profile.avatarVal || "";
    }

    // Set Cover presets
    const coverCards = document.querySelectorAll('#popover-panel-cover .preset-card');
    coverCards.forEach(c => {
        if (c.getAttribute('data-cover') === profile.coverVal) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    selectedCoverVal = profile.coverVal;

    // Set Social link inputs
    document.getElementById('social-instagram-input').value = profile.socialInstagram || "";
    document.getElementById('social-twitter-input').value = profile.socialTwitter || "";
    document.getElementById('social-web-input').value = profile.socialWeb || "";

    // Reset Popover Tab display
    const popTabBtns = document.querySelectorAll('.profile-popover-tab-btn');
    popTabBtns.forEach(btn => btn.classList.remove('active'));
    
    const panels = document.querySelectorAll('.popover-panel');
    panels.forEach(p => p.classList.add('hidden'));

    if (defaultTab === 'avatar') {
        document.getElementById('popover-tab-avatar-btn').classList.add('active');
        document.getElementById('popover-panel-avatar').classList.remove('hidden');
    } else if (defaultTab === 'cover') {
        document.getElementById('popover-tab-cover-btn').classList.add('active');
        document.getElementById('popover-panel-cover').classList.remove('hidden');
    } else if (defaultTab === 'socials') {
        document.getElementById('popover-tab-socials-btn').classList.add('active');
        document.getElementById('popover-panel-socials').classList.remove('hidden');
    }

    // Position Popover dynamically
    const rect = element.getBoundingClientRect();
    const popoverWidth = 340;
    const popoverHeight = 300;
    
    let top = rect.bottom + window.scrollY + 10;
    let left = rect.left + window.scrollX - (popoverWidth / 2) + (rect.width / 2);

    // Boundary constraints
    if (left < 10) left = 10;
    if (left + popoverWidth > window.innerWidth - 10) {
        left = window.innerWidth - popoverWidth - 10;
    }
    if (top + popoverHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - popoverHeight - 10;
    }

    // Set inline coordinates
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.position = 'absolute';
    
}

// Initialize Autocomplete Writer Search Box
function initAuthorSearch() {
    const searchInput = document.getElementById("global-author-search-input");
    const resultsDropdown = document.getElementById("author-search-results");
    
    if (!searchInput || !resultsDropdown) return;

    // Handle typing queries
    searchInput.addEventListener("input", () => {
        const query = normalizeTurkishString(searchInput.value);
        if (!query) {
            resultsDropdown.innerHTML = "";
            resultsDropdown.classList.add("hidden");
            return;
        }

        // Get unique authors from platform database
        const uniqueAuthors = [...new Set(articles.map(a => a.author).filter(Boolean))];
        // Include logged in user if not present
        if (currentUser && currentUser.username && !uniqueAuthors.includes(currentUser.username)) {
            uniqueAuthors.push(currentUser.username);
        }

        // Filter authors matching normalized name query
        const matches = uniqueAuthors.filter(name => {
            return normalizeTurkishString(name).includes(query);
        });

        resultsDropdown.innerHTML = "";
        
        if (matches.length === 0) {
            resultsDropdown.innerHTML = `<div class="author-search-no-results">Eşleşen yazar bulunamadı.</div>`;
        } else {
            matches.forEach(name => {
                const stats = getAuthorStats(name);
                const item = document.createElement("div");
                item.className = "author-search-item";
                
                const avatarHtml = getAuthorAvatarHtml(name, 28);
                item.innerHTML = `
                    ${avatarHtml}
                    <div class="author-search-item-info">
                        <span class="author-search-item-name">${name}</span>
                        <span class="author-search-item-sub">${stats.rank.label} • ${stats.totalArticles} Eser</span>
                    </div>
                `;
                
                item.addEventListener("click", () => {
                    window.openAuthorProfile(name);
                    searchInput.value = "";
                    resultsDropdown.innerHTML = "";
                    resultsDropdown.classList.add("hidden");
                });
                
                resultsDropdown.appendChild(item);
            });
        }
        
        resultsDropdown.classList.remove("hidden");
    });

    // Close results when clicking outside search bar
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
            resultsDropdown.classList.add("hidden");
        }
    });

    // Show results again when input is focused if it contains query
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) {
            resultsDropdown.classList.remove("hidden");
        }
    });
}

window.toggleFollowAuthor = function(authorName) {
    if (toggleFollowState(authorName)) {
        window.openAuthorProfile(authorName);
    }
};

// Handle Goal Updates from UI
window.updateWriterGoal = function(goal) {
    if (!currentUser) return;
    const key = `murekkep_writer_goal_${currentUser.id}`;
    localStorage.setItem(key, goal);
    
    // Sync UI elements
    const stats = getAuthorStats(currentUser.username);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const authorArticles = articles.filter(a => a.author && a.author.trim().toLowerCase() === currentUser.username.trim().toLowerCase());
    
    let last7DaysCount = 0;
    const months = {
        "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
        "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11
    };
    
    authorArticles.forEach(art => {
        const parts = art.date.split(" ");
        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1];
            const year = parseInt(parts[2]);
            const month = months[monthStr] !== undefined ? months[monthStr] : 5;
            const artDate = new Date(year, month, day);
            const diffDays = Math.round(Math.abs((now - artDate) / oneDay));
            if (diffDays <= 7) {
                last7DaysCount++;
            }
        }
    });
    
    const goalVal = parseInt(goal) || 1;
    const progressPct = Math.min(100, Math.round((last7DaysCount / goalVal) * 100));
    
    const goalStatusEl = document.getElementById("writer-goal-status");
    const goalBarEl = document.getElementById("writer-goal-bar");
    
    if (goalStatusEl) goalStatusEl.innerText = `${last7DaysCount} / ${goalVal} Eser`;
    if (goalBarEl) goalBarEl.style.width = `${progressPct}%`;
    
    const streakKey = `murekkep_writer_streak_${currentUser.id}`;
    let streak = parseInt(localStorage.getItem(streakKey) || "0");
    if (last7DaysCount >= goalVal && streak === 0) {
        streak = 1;
        localStorage.setItem(streakKey, "1");
    }
    const streakEl = document.getElementById("writer-goal-streak-val");
    if (streakEl) streakEl.innerText = streak;
    
    showToast(`🎯 Yazım hedefi güncellendi: Haftada ${goalVal} Eser!`);
};

// Bind close button for author modal
document.getElementById("close-author-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("author-modal");
    if (modal) {
        modal.classList.add("hidden");
        unlockBodyScroll();
    }
});

// "Profilim" dropdown button → open own profile modal
document.getElementById("dropdown-profile-btn")?.addEventListener("click", () => {
    // Close the dropdown first
    const dropdown = document.getElementById("profile-dropdown-menu");
    if (dropdown) dropdown.classList.add("hidden");

    if (!currentUser) {
        showToast("Profilinizi görmek için giriş yapmalısınız.");
        return;
    }
    window.openAuthorProfile(currentUser.username || currentUser.email || "Ben");
});


if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", () => {
        bootApp();
        initDynamicViewport();
    });
} else {
    bootApp();
    initDynamicViewport();
}

// Dynamic Viewport & History Manager for Mobile Modals
function initDynamicViewport() {
    const overlays = document.querySelectorAll('.overlay');
    
    let isHandlingPopstate = false;

    // Fix iOS keyboard scroll shift on input/textarea blur inside overlays or drawers
    document.addEventListener('focusout', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            if (e.target.closest('.overlay') || e.target.closest('.comments-drawer')) {
                // Reset window scroll position (iOS visual viewport shift fix)
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            }
        }
    });

    const setMobileViewport = () => {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
        }
    };

    const setDesktopViewport = () => {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=1300');
        }
    };

    const checkOverlays = () => {
        let anyVisible = false;
        let visibleOverlayId = null;

        overlays.forEach(overlay => {
            if (!overlay.classList.contains('hidden')) {
                anyVisible = true;
                visibleOverlayId = overlay.id;
            }
        });
        
        if (commentsDrawer && !commentsDrawer.classList.contains('hidden')) {
            anyVisible = true;
            visibleOverlayId = commentsDrawer.id;
        }

        if (anyVisible) {
            setMobileViewport();
        } else {
            setDesktopViewport();
        }

        // Push state if overlay or drawer is open
        if (anyVisible && visibleOverlayId) {
            if (!isHandlingPopstate && window.location.hash !== '#' + visibleOverlayId) {
                history.pushState({ activeOverlay: visibleOverlayId }, '', '#' + visibleOverlayId);
            }
        } else if (!anyVisible && !isHandlingPopstate && window.location.hash) {
            // Clean history when everything is closed
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                checkOverlays();
            }
        });
    });

    overlays.forEach(overlay => {
        observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    });
    
    if (commentsDrawer) {
        observer.observe(commentsDrawer, { attributes: true, attributeFilter: ['class'] });
    }

    // Listen for mobile/browser back button
    window.addEventListener('popstate', (event) => {
        isHandlingPopstate = true;
        
        // Hide open drawer first
        if (commentsDrawer && !commentsDrawer.classList.contains('hidden')) {
            closeCommentsDrawer();
        }
        
        // Hide open overlays
        overlays.forEach(overlay => {
            if (!overlay.classList.contains('hidden')) {
                // Find and click the close button to trigger all default cleanups
                const closeBtn = overlay.querySelector('.btn-close-overlay, #close-share, .share-close-btn');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    overlay.classList.add('hidden');
                    unlockBodyScroll();
                }
            }
        });

        isHandlingPopstate = false;
        checkOverlays();
    });

    checkOverlays();
    // Scaling is handled natively by the browser via viewport meta tag width=1300
}

// Reading Settings Controller
document.addEventListener("DOMContentLoaded", () => {
    const rsToggle = document.getElementById("reading-settings-toggle");
    const rsDropdown = document.getElementById("reading-settings-dropdown");
    const articleContainer = document.querySelector(".medium-article-container");

    if (rsToggle && rsDropdown && articleContainer) {
        rsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            rsDropdown.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!rsDropdown.classList.contains("hidden") && !rsDropdown.contains(e.target) && e.target !== rsToggle) {
                rsDropdown.classList.add("hidden");
            }
        });

        // Font Family selection
        const fontBtns = document.querySelectorAll(".font-family-options .rs-opt-btn");
        fontBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                fontBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const font = btn.getAttribute("data-font");
                articleContainer.classList.remove("article-font-serif", "article-font-sans", "article-font-classic");
                articleContainer.classList.add("article-font-" + font);
                localStorage.setItem("murekkep_reader_font", font);
            });
        });

        // Font Size selection
        const sizeBtns = document.querySelectorAll(".font-size-options .rs-opt-btn");
        sizeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                sizeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const size = btn.getAttribute("data-size");
                articleContainer.classList.remove("article-size-small", "article-size-medium", "article-size-large");
                articleContainer.classList.add("article-size-" + size);
                localStorage.setItem("murekkep_reader_size", size);
            });
        });

        // Load saved reader preferences
        const savedFont = localStorage.getItem("murekkep_reader_font") || "serif";
        const savedSize = localStorage.getItem("murekkep_reader_size") || "medium";

        const activeFontBtn = document.querySelector(`.font-family-options .rs-opt-btn[data-font="${savedFont}"]`);
        if (activeFontBtn) activeFontBtn.click();

        const activeSizeBtn = document.querySelector(`.font-size-options .rs-opt-btn[data-size="${savedSize}"]`);
        if (activeSizeBtn) activeSizeBtn.click();
    }
});

