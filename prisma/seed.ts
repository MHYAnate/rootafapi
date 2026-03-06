// // prisma/seed.ts

// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// // Utility function to hash passwords
// async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 10);
// }

// async function main() {
//   console.log('🌱 Starting ROOTAF Foundation database seeding...');

//   // ============================================================================
//   // 1. NIGERIAN STATES AND LGAs (COMPLETE DATA)
//   // ============================================================================
//   console.log('📍 Seeding Nigerian States and LGAs...');

//   const statesData = [
//     {
//       name: 'Abia',
//       code: 'AB',
//       region: 'South-East',
//       capital: 'Umuahia',
//       lgas: [
//         'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
//         'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa',
//         'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West',
//         'Umuahia North', 'Umuahia South', 'Umu Nneochi'
//       ]
//     },
//     {
//       name: 'Adamawa',
//       code: 'AD',
//       region: 'North-East',
//       capital: 'Yola',
//       lgas: [
//         'Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong',
//         'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika',
//         'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song',
//         'Toungo', 'Yola North', 'Yola South'
//       ]
//     },
//     {
//       name: 'Akwa Ibom',
//       code: 'AK',
//       region: 'South-South',
//       capital: 'Uyo',
//       lgas: [
//         'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim',
//         'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom',
//         'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu',
//         'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium',
//         'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam',
//         'Udung Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'
//       ]
//     },
//     {
//       name: 'Anambra',
//       code: 'AN',
//       region: 'South-East',
//       capital: 'Awka',
//       lgas: [
//         'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North',
//         'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North',
//         'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South',
//         'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South',
//         'Oyi'
//       ]
//     },
//     {
//       name: 'Bauchi',
//       code: 'BA',
//       region: 'North-East',
//       capital: 'Bauchi',
//       lgas: [
//         'Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass',
//         'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum',
//         'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro',
//         'Warji', 'Zaki'
//       ]
//     },
//     {
//       name: 'Bayelsa',
//       code: 'BY',
//       region: 'South-South',
//       capital: 'Yenagoa',
//       lgas: [
//         'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia',
//         'Sagbama', 'Southern Ijaw', 'Yenagoa'
//       ]
//     },
//     {
//       name: 'Benue',
//       code: 'BE',
//       region: 'North-Central',
//       capital: 'Makurdi',
//       lgas: [
//         'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East',
//         'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo',
//         'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu',
//         'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'
//       ]
//     },
//     {
//       name: 'Borno',
//       code: 'BO',
//       region: 'North-East',
//       capital: 'Maiduguri',
//       lgas: [
//         'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa',
//         'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga',
//         'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa',
//         'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala',
//         'Nganzai', 'Shani'
//       ]
//     },
//     {
//       name: 'Cross River',
//       code: 'CR',
//       region: 'South-South',
//       capital: 'Calabar',
//       lgas: [
//         'Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase',
//         'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom',
//         'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'
//       ]
//     },
//     {
//       name: 'Delta',
//       code: 'DE',
//       region: 'South-South',
//       capital: 'Asaba',
//       lgas: [
//         'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East',
//         'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North',
//         'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North',
//         'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North',
//         'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South',
//         'Warri South West'
//       ]
//     },
//     {
//       name: 'Ebonyi',
//       code: 'EB',
//       region: 'South-East',
//       capital: 'Abakaliki',
//       lgas: [
//         'Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North',
//         'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'
//       ]
//     },
//     {
//       name: 'Edo',
//       code: 'ED',
//       region: 'South-South',
//       capital: 'Benin City',
//       lgas: [
//         'Akoko Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East',
//         'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben',
//         'Ikpoba-Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West',
//         'Owan East', 'Owan West', 'Uhunmwonde'
//       ]
//     },
//     {
//       name: 'Ekiti',
//       code: 'EK',
//       region: 'South-West',
//       capital: 'Ado-Ekiti',
//       lgas: [
//         'Ado-Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West',
//         'Emure', 'Gbonyin', 'Ido-Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje',
//         'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'
//       ]
//     },
//     {
//       name: 'Enugu',
//       code: 'EN',
//       region: 'South-East',
//       capital: 'Enugu',
//       lgas: [
//         'Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South',
//         'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South',
//         'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River',
//         'Udenu', 'Udi', 'Uzo-Uwani'
//       ]
//     },
//     {
//       name: 'FCT',
//       code: 'FC',
//       region: 'North-Central',
//       capital: 'Abuja',
//       lgas: [
//         'Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'
//       ]
//     },
//     {
//       name: 'Gombe',
//       code: 'GO',
//       region: 'North-East',
//       capital: 'Gombe',
//       lgas: [
//         'Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe',
//         'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'
//       ]
//     },
//     {
//       name: 'Imo',
//       code: 'IM',
//       region: 'South-East',
//       capital: 'Owerri',
//       lgas: [
//         'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte Mbaise',
//         'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano',
//         'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele',
//         'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu',
//         'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'
//       ]
//     },
//     {
//       name: 'Jigawa',
//       code: 'JI',
//       region: 'North-West',
//       capital: 'Dutse',
//       lgas: [
//         'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse',
//         'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa',
//         'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama',
//         'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni',
//         'Sule Tankarkar', 'Taura', 'Yankwashi'
//       ]
//     },
//     {
//       name: 'Kaduna',
//       code: 'KD',
//       region: 'North-West',
//       capital: 'Kaduna',
//       lgas: [
//         'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba',
//         'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru',
//         'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi',
//         'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'
//       ]
//     },
//     {
//       name: 'Kano',
//       code: 'KN',
//       region: 'North-West',
//       capital: 'Kano',
//       lgas: [
//         'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure',
//         'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge',
//         'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale',
//         'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru',
//         'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir',
//         'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila',
//         'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo',
//         'Warawa', 'Wudil'
//       ]
//     },
//     {
//       name: 'Katsina',
//       code: 'KT',
//       region: 'North-West',
//       capital: 'Katsina',
//       lgas: [
//         'Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi',
//         'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin-Ma',
//         'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita',
//         'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua',
//         'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi',
//         'Sabuwa', 'Safana', 'Sandamu', 'Zango'
//       ]
//     },
//     {
//       name: 'Kebbi',
//       code: 'KE',
//       region: 'North-West',
//       capital: 'Birnin Kebbi',
//       lgas: [
//         'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi',
//         'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo',
//         'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru',
//         'Wasagu/Danko', 'Yauri', 'Zuru'
//       ]
//     },
//     {
//       name: 'Kogi',
//       code: 'KO',
//       region: 'North-Central',
//       capital: 'Lokoja',
//       lgas: [
//         'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji',
//         'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja',
//         'Mopa-Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro',
//         'Omala', 'Yagba East', 'Yagba West'
//       ]
//     },
//     {
//       name: 'Kwara',
//       code: 'KW',
//       region: 'North-Central',
//       capital: 'Ilorin',
//       lgas: [
//         'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East',
//         'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro',
//         'Offa', 'Oke Ero', 'Oyun', 'Pategi'
//       ]
//     },
//     {
//       name: 'Lagos',
//       code: 'LA',
//       region: 'South-West',
//       capital: 'Ikeja',
//       lgas: [
//         'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
//         'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
//         'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
//         'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
//       ]
//     },
//     {
//       name: 'Nasarawa',
//       code: 'NA',
//       region: 'North-Central',
//       capital: 'Lafia',
//       lgas: [
//         'Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi',
//         'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'
//       ]
//     },
//     {
//       name: 'Niger',
//       code: 'NI',
//       region: 'North-Central',
//       capital: 'Minna',
//       lgas: [
//         'Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga',
//         'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai',
//         'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Munya',
//         'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'
//       ]
//     },
//     {
//       name: 'Ogun',
//       code: 'OG',
//       region: 'South-West',
//       capital: 'Abeokuta',
//       lgas: [
//         'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South',
//         'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East',
//         'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode',
//         'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'
//       ]
//     },
//     {
//       name: 'Ondo',
//       code: 'ON',
//       region: 'South-West',
//       capital: 'Akure',
//       lgas: [
//         'Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East',
//         'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore',
//         'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa',
//         'Ondo East', 'Ondo West', 'Ose', 'Owo'
//       ]
//     },
//     {
//       name: 'Osun',
//       code: 'OS',
//       region: 'South-West',
//       capital: 'Osogbo',
//       lgas: [
//         'Aiyedaade', 'Aiyedire', 'Atakunmosa East', 'Atakunmosa West', 'Boluwaduro',
//         'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo',
//         'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo',
//         'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun',
//         'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin',
//         'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'
//       ]
//     },
//     {
//       name: 'Oyo',
//       code: 'OY',
//       region: 'South-West',
//       capital: 'Ibadan',
//       lgas: [
//         'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North',
//         'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West',
//         'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo',
//         'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu',
//         'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole',
//         'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'
//       ]
//     },
//     {
//       name: 'Plateau',
//       code: 'PL',
//       region: 'North-Central',
//       capital: 'Jos',
//       lgas: [
//         'Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North',
//         'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South',
//         'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'
//       ]
//     },
//     {
//       name: 'Rivers',
//       code: 'RI',
//       region: 'South-South',
//       capital: 'Port Harcourt',
//       lgas: [
//         'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku Toru', 'Andoni',
//         'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua',
//         'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor',
//         'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro',
//         'Oyigbo', 'Port Harcourt', 'Tai'
//       ]
//     },
//     {
//       name: 'Sokoto',
//       code: 'SO',
//       region: 'North-West',
//       capital: 'Sokoto',
//       lgas: [
//         'Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu',
//         'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah',
//         'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South',
//         'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'
//       ]
//     },
//     {
//       name: 'Taraba',
//       code: 'TA',
//       region: 'North-East',
//       capital: 'Jalingo',
//       lgas: [
//         'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi',
//         'Jalingo', 'Karim Lamido', 'Kurmi', 'Lau', 'Sardauna', 'Takum',
//         'Ussa', 'Wukari', 'Yorro', 'Zing'
//       ]
//     },
//     {
//       name: 'Yobe',
//       code: 'YO',
//       region: 'North-East',
//       capital: 'Damaturu',
//       lgas: [
//         'Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam',
//         'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere',
//         'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'
//       ]
//     },
//     {
//       name: 'Zamfara',
//       code: 'ZA',
//       region: 'North-West',
//       capital: 'Gusau',
//       lgas: [
//         'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi',
//         'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara',
//         'Tsafe', 'Zurmi'
//       ]
//     }
//   ];

//   for (const stateData of statesData) {
//     const state = await prisma.nigerianState.create({
//       data: {
//         name: stateData.name,
//         code: stateData.code,
//         region: stateData.region,
//         capital: stateData.capital,
//         isActive: true,
//       },
//     });

//     // Create LGAs for this state
//     for (const lgaName of stateData.lgas) {
//       await prisma.nigerianLGA.create({
//         data: {
//           stateId: state.id,
//           name: lgaName,
//           isActive: true,
//         },
//       });
//     }

//     console.log(`✅ Created ${stateData.name} with ${stateData.lgas.length} LGAs`);
//   }

//   console.log(`✅ Successfully seeded ${statesData.length} states and their LGAs`);

//   // ============================================================================
//   // 2. FOUNDATION OBJECTIVES (From Constitution - Article 3)
//   // ============================================================================
//   console.log('\n📜 Seeding Foundation Objectives...');

//   const objectives = [
//     {
//       objectiveNumber: 1,
//       title: 'To mobilize and unify farmers and artisans under one umbrella.',
//       description: 'Creating a strong network that brings together all farmers and artisans across Nigeria for collective growth and development.',
//       shortDescription: 'Unite farmers and artisans nationwide',
//     },
//     {
//       objectiveNumber: 2,
//       title: 'To advocate for the rights and welfare of members.',
//       description: 'Representing and protecting the interests of farmers and artisans at all levels of government and society.',
//       shortDescription: 'Advocate for member rights and welfare',
//     },
//     {
//       objectiveNumber: 3,
//       title: 'To promote sustainable agricultural and artisan practices.',
//       description: 'Encouraging environmentally friendly and sustainable methods in farming and artisan work.',
//       shortDescription: 'Promote sustainable practices',
//     },
//     {
//       objectiveNumber: 4,
//       title: 'To facilitate access to training, resources, and technology.',
//       description: 'Providing members with access to modern training, tools, and technological advancements.',
//       shortDescription: 'Facilitate training and resources',
//     },
//     {
//       objectiveNumber: 5,
//       title: 'To foster economic empowerment and job creation.',
//       description: 'Creating opportunities for income generation and employment through various programs and initiatives.',
//       shortDescription: 'Foster economic empowerment',
//     },
//     {
//       objectiveNumber: 6,
//       title: 'To establish partnerships with government, NGOs, and private sector.',
//       description: 'Building strategic alliances with key stakeholders for the benefit of members.',
//       shortDescription: 'Establish strategic partnerships',
//     },
//     {
//       objectiveNumber: 7,
//       title: 'To support youth participation in agriculture and skilled trades.',
//       description: 'Encouraging and supporting young people to engage in farming and artisan work.',
//       shortDescription: 'Support youth participation',
//     },
//     {
//       objectiveNumber: 8,
//       title: 'To provide a marketplace for members\' products and services.',
//       description: 'Creating platforms for members to showcase and sell their products and services.',
//       shortDescription: 'Provide marketplace platform',
//     },
//     {
//       objectiveNumber: 9,
//       title: 'To promote research and innovation in agriculture and artisan works.',
//       description: 'Supporting research and development to improve farming and artisan techniques.',
//       shortDescription: 'Promote research and innovation',
//     },
//     {
//       objectiveNumber: 10,
//       title: 'To encourage community development and social responsibility.',
//       description: 'Engaging in activities that benefit the broader community and promote social welfare.',
//       shortDescription: 'Encourage community development',
//     },
//   ];

//   for (const objective of objectives) {
//     await prisma.foundationObjective.create({
//       data: objective,
//     });
//   }

//   console.log(`✅ Successfully seeded ${objectives.length} foundation objectives`);

//   // ============================================================================
//   // 3. SUPER ADMIN ACCOUNT
//   // ============================================================================
//   console.log('\n👤 Creating Super Admin account...');

//   const superAdmin = await prisma.adminUser.create({
//     data: {
//       username: 'superadmin',
//       passwordHash: await hashPassword('ROOTAF@2025!'),
//       fullName: 'ROOTAF Super Administrator',
//       phoneNumber: '+2348000000000',
//       email: 'admin@rootaf.org',
//       role: 'SUPER_ADMIN',
//       canVerifyMembers: true,
//       canVerifyClients: true,
//       canResetPasswords: true,
//       canManageContent: true,
//       canManageEvents: true,
//       canManageAdmins: true,
//       canExportData: true,
//       canAccessReports: true,
//       isActive: true,
//       mustChangePassword: false,
//     },
//   });

//   console.log(`✅ Created Super Admin: ${superAdmin.username}`);

//   // ============================================================================
//   // 4. ADDITIONAL ADMIN USERS (Leadership)
//   // ============================================================================
//   console.log('\n👥 Creating Leadership Admin accounts...');

//   // Head of Legal Affairs - Barr. Firdausi Abdulmajid Ibrahim Majidadi
//   const legalAdmin = await prisma.adminUser.create({
//     data: {
//       username: 'legal_affairs',
//       passwordHash: await hashPassword('Legal@ROOTAF2025'),
//       fullName: 'Barr. Firdausi Abdulmajid Ibrahim Majidadi',
//       phoneNumber: '+2348011111111',
//       email: 'legal@rootaf.org',
//       role: 'CONTENT_ADMIN',
//       canVerifyMembers: false,
//       canVerifyClients: false,
//       canResetPasswords: false,
//       canManageContent: true,
//       canManageEvents: true,
//       canManageAdmins: false,
//       canExportData: true,
//       canAccessReports: true,
//       isActive: true,
//       mustChangePassword: true,
//       createdByAdminId: superAdmin.id,
//     },
//   });

//   // Head of ICT - Mohammed Hayatudeen Yusuf
//   const ictAdmin = await prisma.adminUser.create({
//     data: {
//       username: 'ict_head',
//       passwordHash: await hashPassword('ICT@ROOTAF2025'),
//       fullName: 'Mohammed Hayatudeen Yusuf',
//       phoneNumber: '+2348022222222',
//       email: 'ict@rootaf.org',
//       role: 'SUPER_ADMIN',
//       canVerifyMembers: true,
//       canVerifyClients: true,
//       canResetPasswords: true,
//       canManageContent: true,
//       canManageEvents: true,
//       canManageAdmins: true,
//       canExportData: true,
//       canAccessReports: true,
//       isActive: true,
//       mustChangePassword: true,
//       createdByAdminId: superAdmin.id,
//     },
//   });

//   // Verification Admin
//   const verificationAdmin = await prisma.adminUser.create({
//     data: {
//       username: 'verification_admin',
//       passwordHash: await hashPassword('Verify@ROOTAF2025'),
//       fullName: 'Verification Administrator',
//       phoneNumber: '+2348033333333',
//       email: 'verification@rootaf.org',
//       role: 'VERIFICATION_ADMIN',
//       canVerifyMembers: true,
//       canVerifyClients: true,
//       canResetPasswords: true,
//       canManageContent: false,
//       canManageEvents: false,
//       canManageAdmins: false,
//       canExportData: false,
//       canAccessReports: true,
//       isActive: true,
//       mustChangePassword: true,
//       createdByAdminId: superAdmin.id,
//     },
//   });

//   console.log(`✅ Created Head of Legal Affairs: ${legalAdmin.fullName}`);
//   console.log(`✅ Created Head of ICT: ${ictAdmin.fullName}`);
//   console.log(`✅ Created Verification Admin: ${verificationAdmin.fullName}`);

//   // ============================================================================
//   // 5. LEADERSHIP PROFILES
//   // ============================================================================
//   console.log('\n🎖️ Creating Leadership Profiles...');

//   await prisma.leadershipProfile.create({
//     data: {
//       fullName: 'Artisan Nuhu Ibrahim Majidadi',
//       position: 'Founder & CEO, ROOTAF SEEDS INITIATIVES',
//       title: 'Artisan',
//       bio: 'Founder of ROOTAF SEEDS INITIATIVES and CEO of EMAHN NIG LTD. Visionary leader committed to empowering farmers and artisans across Nigeria. "Rooted to Rise — from the root, we rise; no matter the soil, we grow."',
//       shortBio: 'Founder of ROOTAF Foundation and CEO of EMAHN NIG LTD',
//       isFounder: true,
//       isTrustee: true,
//       isActive: true,
//       showOnAboutPage: true,
//       displayOrder: 1,
//     },
//   });

//   await prisma.leadershipProfile.create({
//     data: {
//       fullName: 'Abubakar Adamu',
//       position: 'National Coordinator',
//       title: 'Comrade',
//       bio: 'National Coordinator of ROOTAF Foundation, providing strategic leadership and coordination of all foundation activities nationwide.',
//       shortBio: 'National Coordinator of ROOTAF Foundation',
//       isTrustee: true,
//       isActive: true,
//       showOnAboutPage: true,
//       displayOrder: 2,
//     },
//   });

//   await prisma.leadershipProfile.create({
//     data: {
//       fullName: 'Barr. Firdausi Abdulmajid Ibrahim Majidadi',
//       position: 'Head of Legal Affairs',
//       title: 'Barr.',
//       bio: 'Legal pillar of ROOTAF Foundation. Expert in constitutional law and institutional governance. Ensures ROOTAF operates with credibility, discipline, and professional excellence in accordance with legal and regulatory requirements.',
//       shortBio: 'Head of Legal Affairs',
//       email: 'legal@rootaf.org',
//       isTrustee: false,
//       isActive: true,
//       showOnAboutPage: true,
//       displayOrder: 3,
//     },
//   });

//   await prisma.leadershipProfile.create({
//     data: {
//       fullName: 'Mohammed Hayatudeen Yusuf',
//       position: 'Head of ICT Department',
//       bio: 'Head of Information and Communication Technology Department. Oversees all digital infrastructure and technological innovation for ROOTAF Foundation.',
//       shortBio: 'Head of ICT Department',
//       email: 'ict@rootaf.org',
//       isTrustee: false,
//       isActive: true,
//       showOnAboutPage: true,
//       displayOrder: 4,
//     },
//   });

//   console.log('✅ Created 4 leadership profiles');

//   // ============================================================================
//   // 6. ABOUT CONTENT SECTIONS
//   // ============================================================================
//   console.log('\n📄 Creating About Page Content...');

//   await prisma.aboutContent.create({
//     data: {
//       sectionKey: 'MISSION_STATEMENT',
//       title: 'Our Mission',
//       content: 'To empower farmers and artisans across Nigeria by providing a unified platform for advocacy, skill development, market access, and sustainable livelihood enhancement.',
//       isVisible: true,
//       displayOrder: 1,
//       updatedByAdminId: superAdmin.id,
//     },
//   });

//   await prisma.aboutContent.create({
//     data: {
//       sectionKey: 'VISION_STATEMENT',
//       title: 'Our Vision',
//       content: 'A prosperous Nigeria where every farmer and artisan thrives through unity, innovation, and sustainable practices — becoming beacons of economic growth and community development.',
//       isVisible: true,
//       displayOrder: 2,
//       updatedByAdminId: superAdmin.id,
//     },
//   });

//   await prisma.aboutContent.create({
//     data: {
//       sectionKey: 'OVERVIEW',
//       title: 'About ROOTAF Foundation',
//       content: 'ROOTAF (Rooted to Rise) Foundation is a registered non-profit organization dedicated to uniting and empowering farmers and artisans across Nigeria. Rooted to Rise — from the root, we rise; no matter the soil, we grow. 🌱\n\nWe believe in the power of unity, skill development, and sustainable practices to transform lives and communities. Through our platform, members can showcase their products and services, access training, connect with clients, and grow their businesses.',
//       isVisible: true,
//       displayOrder: 3,
//       updatedByAdminId: superAdmin.id,
//     },
//   });

//   await prisma.aboutContent.create({
//     data: {
//       sectionKey: 'CORE_VALUES',
//       title: 'Our Core Values',
//       content: '• **Integrity**: We uphold the highest standards of honesty and transparency\n• **Justice**: We advocate for fair treatment and equal opportunities\n• **Fairness**: We ensure equitable access to resources and opportunities\n• **Unity**: We believe in the strength of collective action\n• **Excellence**: We strive for quality in all we do\n• **Sustainability**: We promote environmentally responsible practices',
//       isVisible: true,
//       displayOrder: 4,
//       updatedByAdminId: superAdmin.id,
//     },
//   });

//   console.log('✅ Created About page content sections');

//   // ============================================================================
//   // 7. CONTACT INFORMATION
//   // ============================================================================
//   console.log('\n📞 Creating Contact Information...');

//   await prisma.contactInfo.create({
//     data: {
//       contactType: 'headquarters',
//       label: 'ROOTAF Foundation Headquarters',
//       address: 'ROOTAF Foundation Secretariat',
//       city: 'Kaduna',
//       localGovernmentArea: 'Kaduna North',
//       state: 'Kaduna',
//       country: 'Nigeria',
//       phoneNumber1: '+2348000000001',
//       email: 'info@rootaf.org',
//       alternateEmail: 'contact@rootaf.org',
//       isPrimary: true,
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   console.log('✅ Created contact information');

//   // ============================================================================
//   // 8. SOCIAL MEDIA LINKS
//   // ============================================================================
//   console.log('\n📱 Creating Social Media Links...');

//   const socialMediaPlatforms = [
//     { platform: 'facebook', platformName: 'Facebook', url: 'https://facebook.com/rootaf', iconName: 'facebook' },
//     { platform: 'twitter', platformName: 'Twitter/X', url: 'https://twitter.com/rootaf', iconName: 'twitter' },
//     { platform: 'instagram', platformName: 'Instagram', url: 'https://instagram.com/rootaf', iconName: 'instagram' },
//     { platform: 'linkedin', platformName: 'LinkedIn', url: 'https://linkedin.com/company/rootaf', iconName: 'linkedin' },
//     { platform: 'youtube', platformName: 'YouTube', url: 'https://youtube.com/@rootaf', iconName: 'youtube' },
//   ];

//   for (let i = 0; i < socialMediaPlatforms.length; i++) {
//     await prisma.socialMediaLink.create({
//       data: {
//         ...socialMediaPlatforms[i],
//         isActive: true,
//         displayOrder: i + 1,
//       },
//     });
//   }

//   console.log(`✅ Created ${socialMediaPlatforms.length} social media links`);

//   // ============================================================================
//   // 9. SAMPLE CATEGORIES (Limited for testing)
//   // ============================================================================
//   console.log('\n🏷️ Creating Sample Categories...');

//   // Farmer Specializations
//   const farmerCat1 = await prisma.category.create({
//     data: {
//       categoryCode: 'FRM-01',
//       categoryType: 'FARMER_SPECIALIZATION',
//       name: 'Crop Farming',
//       description: 'Cultivation of crops including grains, vegetables, and cash crops',
//       examples: ['Maize', 'Rice', 'Tomatoes', 'Pepper', 'Yam'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   const farmerCat2 = await prisma.category.create({
//     data: {
//       categoryCode: 'FRM-02',
//       categoryType: 'FARMER_SPECIALIZATION',
//       name: 'Livestock Farming',
//       description: 'Rearing of animals for food and other products',
//       examples: ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Fish'],
//       isActive: true,
//       displayOrder: 2,
//     },
//   });

//   const farmerCat3 = await prisma.category.create({
//     data: {
//       categoryCode: 'FRM-03',
//       categoryType: 'FARMER_SPECIALIZATION',
//       name: 'Poultry Farming',
//       description: 'Raising domestic birds for eggs and meat',
//       examples: ['Broilers', 'Layers', 'Turkey', 'Guinea fowl'],
//       isActive: true,
//       displayOrder: 3,
//     },
//   });

//   // Artisan Specializations
//   const artisanCat1 = await prisma.category.create({
//     data: {
//       categoryCode: 'ART-01',
//       categoryType: 'ARTISAN_SPECIALIZATION',
//       name: 'Tailoring & Fashion',
//       description: 'Clothing design, sewing, and fashion production',
//       examples: ['Traditional wear', 'Casual wear', 'Corporate attire', 'Embroidery'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   const artisanCat2 = await prisma.category.create({
//     data: {
//       categoryCode: 'ART-02',
//       categoryType: 'ARTISAN_SPECIALIZATION',
//       name: 'Carpentry & Woodwork',
//       description: 'Working with wood to create furniture and structures',
//       examples: ['Furniture making', 'Doors', 'Windows', 'Carving'],
//       isActive: true,
//       displayOrder: 2,
//     },
//   });

//   const artisanCat3 = await prisma.category.create({
//     data: {
//       categoryCode: 'ART-03',
//       categoryType: 'ARTISAN_SPECIALIZATION',
//       name: 'Welding & Metalwork',
//       description: 'Working with metal to create structures and items',
//       examples: ['Gates', 'Burglar proof', 'Railings', 'Metal furniture'],
//       isActive: true,
//       displayOrder: 3,
//     },
//   });

//   // Product Categories - Agricultural
//   const productCatAgri1 = await prisma.category.create({
//     data: {
//       categoryCode: 'PRD-A01',
//       categoryType: 'PRODUCT_AGRICULTURAL',
//       name: 'Grains & Cereals',
//       description: 'Agricultural grain products',
//       examples: ['Rice', 'Maize', 'Millet', 'Sorghum'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   const productCatAgri2 = await prisma.category.create({
//     data: {
//       categoryCode: 'PRD-A02',
//       categoryType: 'PRODUCT_AGRICULTURAL',
//       name: 'Vegetables',
//       description: 'Fresh vegetables from farms',
//       examples: ['Tomatoes', 'Pepper', 'Onions', 'Leafy greens'],
//       isActive: true,
//       displayOrder: 2,
//     },
//   });

//   // Product Categories - Artisan
//   const productCatArt1 = await prisma.category.create({
//     data: {
//       categoryCode: 'PRD-R01',
//       categoryType: 'PRODUCT_ARTISAN',
//       name: 'Clothing & Textiles',
//       description: 'Handmade clothing and textile products',
//       examples: ['Dresses', 'Shirts', 'Traditional wear', 'Fabrics'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   // Service Categories - Farming
//   const serviceCatFarm1 = await prisma.category.create({
//     data: {
//       categoryCode: 'SRV-F01',
//       categoryType: 'SERVICE_FARMING',
//       name: 'Land Preparation',
//       description: 'Farm land clearing and preparation services',
//       examples: ['Plowing', 'Harrowing', 'Ridging'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   // Service Categories - Artisan
//   const serviceCatArt1 = await prisma.category.create({
//     data: {
//       categoryCode: 'SRV-A01',
//       categoryType: 'SERVICE_ARTISAN',
//       name: 'Tailoring Services',
//       description: 'Professional sewing and alterations',
//       examples: ['Clothing design', 'Alterations', 'Repairs'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   // Tool Categories - Farming
//   const toolCatFarm1 = await prisma.category.create({
//     data: {
//       categoryCode: 'TL-F01',
//       categoryType: 'TOOL_FARMING',
//       name: 'Tillage Equipment',
//       description: 'Tools for soil preparation',
//       examples: ['Tractors', 'Plows', 'Harrows', 'Hoes'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   // Tool Categories - Artisan
//   const toolCatArt1 = await prisma.category.create({
//     data: {
//       categoryCode: 'TL-A01',
//       categoryType: 'TOOL_ARTISAN',
//       name: 'Sewing Equipment',
//       description: 'Tools for tailoring and sewing',
//       examples: ['Sewing machines', 'Scissors', 'Measuring tape'],
//       isActive: true,
//       displayOrder: 1,
//     },
//   });

//   console.log('✅ Created 14 sample categories');

//   // ============================================================================
//   // 10. TEST USERS (Limited for testing)
//   // ============================================================================
//   console.log('\n👥 Creating Test Users...');

//   // Test Member (Farmer) - Use include to get memberProfile
//   const testFarmer = await prisma.user.create({
//     data: {
//       phoneNumber: '08012345678',
//       countryCode: '+234',
//       passwordHash: await hashPassword('TestFarmer123'),
//       userType: 'MEMBER',
//       fullName: 'Ibrahim Suleiman',
//       email: 'ibrahim.farmer@test.com',
//       verificationStatus: 'VERIFIED',
//       verificationSubmittedAt: new Date(),
//       verifiedAt: new Date(),
//       verifiedByAdminId: superAdmin.id,
//       isActive: true,
//       memberProfile: {
//         create: {
//           providerType: 'FARMER',
//           bio: 'Experienced crop farmer specializing in maize and rice cultivation. Over 10 years of experience in sustainable farming practices.',
//           address: 'Farm Settlement, Igabi LGA',
//           localGovernmentArea: 'Igabi',
//           state: 'Kaduna',
//           yearsOfExperience: 10,
//           isProfileComplete: true,
//           profileCompleteness: 85,
//         },
//       },
//     },
//     include: {
//       memberProfile: true,
//     },
//   });

//   // Add specialization for farmer
//   if (testFarmer.memberProfile) {
//     await prisma.memberSpecialization.create({
//       data: {
//         memberId: testFarmer.memberProfile.id,
//         specializationType: 'FARMER',
//         categoryId: farmerCat1.id,
//         specificSkills: ['Maize farming', 'Rice cultivation', 'Irrigation'],
//         isPrimary: true,
//         displayOrder: 1,
//       },
//     });

//     // Create a sample product for the farmer
//     await prisma.product.create({
//       data: {
//         memberId: testFarmer.memberProfile.id,
//         categoryId: productCatAgri1.id,
//         name: 'Premium Quality Maize',
//         description: 'High-quality maize harvested from our farm. Clean, dry, and ready for consumption or processing.',
//         shortDescription: 'Fresh, premium quality maize',
//         unitOfMeasure: 'bags',
//         minimumOrderQuantity: 5,
//         availableQuantity: 100,
//         pricingType: 'BOTH',
//         priceAmount: 35000,
//         pricePerUnit: 'per 100kg bag',
//         priceDisplayText: '₦35,000 per bag (Negotiable)',
//         availability: 'AVAILABLE',
//         tags: ['maize', 'grains', 'cereals', 'farm produce'],
//         isActive: true,
//         publishedAt: new Date(),
//       },
//     });
//   }

//   console.log(`✅ Created test farmer: ${testFarmer.fullName}`);

//   // Test Member (Artisan) - Use include to get memberProfile
//   const testArtisan = await prisma.user.create({
//     data: {
//       phoneNumber: '08098765432',
//       countryCode: '+234',
//       passwordHash: await hashPassword('TestArtisan123'),
//       userType: 'MEMBER',
//       fullName: 'Fatima Mohammed',
//       email: 'fatima.tailor@test.com',
//       verificationStatus: 'VERIFIED',
//       verificationSubmittedAt: new Date(),
//       verifiedAt: new Date(),
//       verifiedByAdminId: superAdmin.id,
//       isActive: true,
//       memberProfile: {
//         create: {
//           providerType: 'ARTISAN',
//           bio: 'Professional tailor with expertise in traditional and modern fashion. Specializing in native attire and corporate wear.',
//           address: 'Sabon Gari Market, Kaduna',
//           localGovernmentArea: 'Kaduna North',
//           state: 'Kaduna',
//           yearsOfExperience: 8,
//           isProfileComplete: true,
//           profileCompleteness: 90,
//         },
//       },
//     },
//     include: {
//       memberProfile: true,
//     },
//   });

//   // Add specialization for artisan
//   if (testArtisan.memberProfile) {
//     await prisma.memberSpecialization.create({
//       data: {
//         memberId: testArtisan.memberProfile.id,
//         specializationType: 'ARTISAN',
//         categoryId: artisanCat1.id,
//         specificSkills: ['Traditional wear', 'Corporate attire', 'Embroidery', 'Bridal wear'],
//         isPrimary: true,
//         displayOrder: 1,
//       },
//     });

//     // Create a sample service for the artisan
//     await prisma.service.create({
//       data: {
//         memberId: testArtisan.memberProfile.id,
//         categoryId: serviceCatArt1.id,
//         name: 'Professional Tailoring Services',
//         description: 'Expert tailoring services for all occasions. We specialize in traditional wear, corporate attire, and bridal fashion.',
//         shortDescription: 'Expert tailoring for all occasions',
//         serviceArea: 'Kaduna and surrounding areas',
//         pricingType: 'BOTH',
//         startingPrice: 10000,
//         maximumPrice: 150000,
//         priceBasis: 'Per outfit',
//         priceDisplayText: 'From ₦10,000 (varies by design)',
//         availability: 'AVAILABLE',
//         workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
//         workingHoursStart: '09:00',
//         workingHoursEnd: '18:00',
//         tags: ['tailoring', 'fashion', 'native wear', 'bridal'],
//         isActive: true,
//         publishedAt: new Date(),
//       },
//     });
//   }

//   console.log(`✅ Created test artisan: ${testArtisan.fullName}`);

//   // Test Member (Both Farmer and Artisan)
//   const testBoth = await prisma.user.create({
//     data: {
//       phoneNumber: '08066666666',
//       countryCode: '+234',
//       passwordHash: await hashPassword('TestBoth123'),
//       userType: 'MEMBER',
//       fullName: 'Musa Aliyu',
//       email: 'musa.both@test.com',
//       verificationStatus: 'VERIFIED',
//       verificationSubmittedAt: new Date(),
//       verifiedAt: new Date(),
//       verifiedByAdminId: superAdmin.id,
//       isActive: true,
//       memberProfile: {
//         create: {
//           providerType: 'BOTH',
//           bio: 'Poultry farmer and skilled welder. Running a poultry farm and welding workshop in Zaria.',
//           address: 'Sabon Gari, Zaria',
//           localGovernmentArea: 'Zaria',
//           state: 'Kaduna',
//           yearsOfExperience: 12,
//           isProfileComplete: true,
//           profileCompleteness: 80,
//         },
//       },
//     },
//     include: {
//       memberProfile: true,
//     },
//   });

//   // Add specializations for both farmer and artisan
//   if (testBoth.memberProfile) {
//     await prisma.memberSpecialization.create({
//       data: {
//         memberId: testBoth.memberProfile.id,
//         specializationType: 'FARMER',
//         categoryId: farmerCat3.id,
//         specificSkills: ['Broilers', 'Layers', 'Poultry management'],
//         isPrimary: true,
//         displayOrder: 1,
//       },
//     });

//     await prisma.memberSpecialization.create({
//       data: {
//         memberId: testBoth.memberProfile.id,
//         specializationType: 'ARTISAN',
//         categoryId: artisanCat3.id,
//         specificSkills: ['Gates', 'Burglar proof', 'Metal furniture'],
//         isPrimary: false,
//         displayOrder: 2,
//       },
//     });
//   }

//   console.log(`✅ Created test dual member: ${testBoth.fullName}`);

//   // Test Client
//   const testClient = await prisma.user.create({
//     data: {
//       phoneNumber: '08055555555',
//       countryCode: '+234',
//       passwordHash: await hashPassword('TestClient123'),
//       userType: 'CLIENT',
//       fullName: 'Amina Yusuf',
//       email: 'amina.client@test.com',
//       verificationStatus: 'VERIFIED',
//       verificationSubmittedAt: new Date(),
//       verifiedAt: new Date(),
//       verifiedByAdminId: superAdmin.id,
//       isActive: true,
//       clientProfile: {
//         create: {
//           address: 'Barnawa, Kaduna',
//           localGovernmentArea: 'Kaduna South',
//           state: 'Kaduna',
//         },
//       },
//     },
//     include: {
//       clientProfile: true,
//     },
//   });

//   console.log(`✅ Created test client: ${testClient.fullName}`);

//   // Pending Member (For testing verification)
//   const pendingMember = await prisma.user.create({
//     data: {
//       phoneNumber: '08077777777',
//       countryCode: '+234',
//       passwordHash: await hashPassword('PendingMember123'),
//       userType: 'MEMBER',
//       fullName: 'Hassan Garba',
//       email: 'hassan.pending@test.com',
//       verificationStatus: 'PENDING',
//       verificationSubmittedAt: new Date(),
//       isActive: true,
//       memberProfile: {
//         create: {
//           providerType: 'FARMER',
//           bio: 'Aspiring commercial farmer seeking verification.',
//           address: 'Rigasa, Kaduna',
//           localGovernmentArea: 'Igabi',
//           state: 'Kaduna',
//           yearsOfExperience: 3,
//           isProfileComplete: false,
//           profileCompleteness: 60,
//         },
//       },
//     },
//   });

//   console.log(`✅ Created pending member: ${pendingMember.fullName}`);

//   // ============================================================================
//   // 11. SAMPLE TESTIMONIAL
//   // ============================================================================
//   console.log('\n💬 Creating Sample Testimonials...');

//   await prisma.testimonial.create({
//     data: {
//       personName: 'Musa Abdullahi',
//       titleRole: 'Tomato Farmer, Igabi LGA',
//       location: 'Kaduna State',
//       testimonialText: 'ROOTAF Foundation has transformed my farming business. Through their platform, I\'ve connected with buyers directly and increased my income by 60%. The training programs have also helped me adopt modern farming techniques.',
//       shortQuote: 'ROOTAF transformed my farming business!',
//       category: 'MEMBER_SUCCESS_STORY',
//       rating: 5,
//       isApproved: true,
//       approvedByAdminId: superAdmin.id,
//       approvedAt: new Date(),
//       isFeatured: true,
//       isVisible: true,
//       showOnAboutPage: true,
//       showOnHomePage: true,
//       testimonialDate: new Date(),
//       displayOrder: 1,
//     },
//   });

//   await prisma.testimonial.create({
//     data: {
//       personName: 'Hauwa Ibrahim',
//       titleRole: 'Fashion Designer, Kaduna',
//       location: 'Kaduna State',
//       testimonialText: 'As a young artisan, ROOTAF has given me visibility I never imagined. Clients find me through the platform, and I\'ve been able to expand my tailoring business significantly.',
//       shortQuote: 'ROOTAF gave me visibility and growth!',
//       category: 'YOUTH_EMPOWERMENT',
//       rating: 5,
//       isApproved: true,
//       approvedByAdminId: superAdmin.id,
//       approvedAt: new Date(),
//       isFeatured: true,
//       isVisible: true,
//       showOnAboutPage: true,
//       showOnHomePage: false,
//       testimonialDate: new Date(),
//       displayOrder: 2,
//     },
//   });

//   console.log('✅ Created 2 sample testimonials');

//   // ============================================================================
//   // 12. SAMPLE EVENT
//   // ============================================================================
//   console.log('\n📅 Creating Sample Events...');

//   const agmEvent = await prisma.event.create({
//     data: {
//       title: 'ROOTAF Foundation Annual General Meeting 2025',
//       eventType: 'ANNUAL_GENERAL_MEETING',
//       description: 'The first Annual General Meeting of ROOTAF Foundation. All members are invited to participate in shaping the future of our organization. Join us for a day of unity, planning, and celebration.',
//       shortDescription: 'ROOTAF AGM 2025 - Shaping our collective future',
//       startDate: new Date('2025-06-15'),
//       startTime: '10:00 AM',
//       endDate: new Date('2025-06-15'),
//       endTime: '4:00 PM',
//       venueName: 'ROOTAF Foundation Secretariat',
//       venueAddress: 'Kaduna',
//       cityLga: 'Kaduna North',
//       state: 'Kaduna',
//       status: 'UPCOMING',
//       isPublished: true,
//       publishedAt: new Date(),
//       isFeatured: true,
//       showOnHomePage: true,
//       tags: ['AGM', 'Annual Meeting', 'Members'],
//       createdByAdminId: superAdmin.id,
//     },
//   });

//   // Add agenda items for the event
//   await prisma.eventAgendaItem.createMany({
//     data: [
//       {
//         eventId: agmEvent.id,
//         startTime: '10:00 AM',
//         endTime: '10:30 AM',
//         title: 'Registration and Welcome',
//         description: 'Arrival and registration of participants',
//         displayOrder: 1,
//       },
//       {
//         eventId: agmEvent.id,
//         startTime: '10:30 AM',
//         endTime: '11:00 AM',
//         title: 'Opening Prayer and National Anthem',
//         description: 'Formal opening of the AGM',
//         displayOrder: 2,
//       },
//       {
//         eventId: agmEvent.id,
//         startTime: '11:00 AM',
//         endTime: '12:00 PM',
//         title: 'Address by the National Coordinator',
//         speakerName: 'Abubakar Adamu',
//         speakerTitle: 'National Coordinator',
//         description: 'State of the foundation address',
//         displayOrder: 3,
//       },
//       {
//         eventId: agmEvent.id,
//         startTime: '12:00 PM',
//         endTime: '1:00 PM',
//         title: 'Lunch Break',
//         isBreak: true,
//         displayOrder: 4,
//       },
//       {
//         eventId: agmEvent.id,
//         startTime: '1:00 PM',
//         endTime: '3:00 PM',
//         title: 'Member Presentations and Discussions',
//         description: 'Open forum for member contributions',
//         displayOrder: 5,
//       },
//       {
//         eventId: agmEvent.id,
//         startTime: '3:00 PM',
//         endTime: '4:00 PM',
//         title: 'Closing and Vote of Thanks',
//         description: 'Conclusion of the AGM',
//         displayOrder: 6,
//       },
//     ],
//   });

//   // Create a training workshop event
//   await prisma.event.create({
//     data: {
//       title: 'Modern Farming Techniques Workshop',
//       eventType: 'TRAINING_WORKSHOP',
//       description: 'A comprehensive workshop on modern farming techniques, including irrigation systems, pest management, and sustainable practices.',
//       shortDescription: 'Learn modern farming techniques',
//       startDate: new Date('2025-03-20'),
//       startTime: '9:00 AM',
//       endDate: new Date('2025-03-21'),
//       endTime: '5:00 PM',
//       venueName: 'Agricultural Training Center',
//       venueAddress: 'Samaru, Zaria',
//       cityLga: 'Zaria',
//       state: 'Kaduna',
//       status: 'UPCOMING',
//       isPublished: true,
//       publishedAt: new Date(),
//       isFeatured: false,
//       showOnHomePage: false,
//       tags: ['Training', 'Farming', 'Agriculture', 'Workshop'],
//       createdByAdminId: superAdmin.id,
//     },
//   });

//   console.log('✅ Created 2 sample events with agenda');

//   // ============================================================================
//   // 13. SYSTEM SETTINGS
//   // ============================================================================
//   console.log('\n⚙️ Creating System Settings...');

//   const systemSettings = [
//     {
//       settingKey: 'platform_name',
//       settingGroup: 'general',
//       displayName: 'Platform Name',
//       settingValue: 'ROOTAF Foundation',
//       settingType: 'string',
//       isEditable: false,
//       isPublic: true,
//     },
//     {
//       settingKey: 'platform_tagline',
//       settingGroup: 'general',
//       displayName: 'Platform Tagline',
//       settingValue: 'Rooted to Rise — from the root, we rise; no matter the soil, we grow. 🌱',
//       settingType: 'string',
//       isEditable: true,
//       isPublic: true,
//     },
//     {
//       settingKey: 'default_currency',
//       settingGroup: 'general',
//       displayName: 'Default Currency',
//       settingValue: 'NGN',
//       settingType: 'string',
//       isEditable: false,
//       isPublic: true,
//     },
//     {
//       settingKey: 'max_failed_login_attempts',
//       settingGroup: 'security',
//       displayName: 'Max Failed Login Attempts',
//       settingValue: '5',
//       settingType: 'number',
//       isEditable: true,
//       isPublic: false,
//     },
//     {
//       settingKey: 'session_timeout_minutes',
//       settingGroup: 'security',
//       displayName: 'Session Timeout (Minutes)',
//       settingValue: '60',
//       settingType: 'number',
//       isEditable: true,
//       isPublic: false,
//     },
//     {
//       settingKey: 'enable_user_registration',
//       settingGroup: 'general',
//       displayName: 'Enable User Registration',
//       settingValue: 'true',
//       settingType: 'boolean',
//       isEditable: true,
//       isPublic: true,
//     },
//     {
//       settingKey: 'max_product_images',
//       settingGroup: 'limits',
//       displayName: 'Max Product Images',
//       settingValue: '5',
//       settingType: 'number',
//       isEditable: true,
//       isPublic: false,
//     },
//     {
//       settingKey: 'max_file_size_mb',
//       settingGroup: 'limits',
//       displayName: 'Max File Size (MB)',
//       settingValue: '5',
//       settingType: 'number',
//       isEditable: true,
//       isPublic: false,
//     },
//   ];

//   for (const setting of systemSettings) {
//     await prisma.systemSetting.create({
//       data: setting,
//     });
//   }

//   console.log(`✅ Created ${systemSettings.length} system settings`);

//   // ============================================================================
//   // 14. SAMPLE FAQs
//   // ============================================================================
//   console.log('\n❓ Creating Sample FAQs...');

//   const faqs = [
//     {
//       question: 'How do I register as a member on ROOTAF platform?',
//       answer: 'To register as a member, click on the "Register" button, select "Member" as your user type, fill in your details including phone number, upload required documents (profile photo and at least one ID document), and submit. An admin will review and verify your account within 1-3 business days.',
//       category: 'registration',
//       targetAudience: 'members',
//       isVisible: true,
//       isFeatured: true,
//       displayOrder: 1,
//     },
//     {
//       question: 'Can I be both a farmer and an artisan?',
//       answer: 'Yes! When creating your profile, you can select "Both" as your provider type. This allows you to showcase both your farming and artisan skills, products, and services on a single profile.',
//       category: 'registration',
//       targetAudience: 'members',
//       isVisible: true,
//       displayOrder: 2,
//     },
//     {
//       question: 'How long does verification take?',
//       answer: 'Verification typically takes 1-3 business days. Our admin team reviews each application carefully to ensure authenticity. You will receive a notification once your account is verified or if additional information is required.',
//       category: 'registration',
//       targetAudience: 'all',
//       isVisible: true,
//       displayOrder: 3,
//     },
//     {
//       question: 'Can I rate a member without being verified?',
//       answer: 'No. Only verified clients can submit ratings and reviews. This ensures the authenticity and credibility of our rating system. To get verified, you need to upload your NIN photo during registration.',
//       category: 'ratings',
//       targetAudience: 'clients',
//       isVisible: true,
//       displayOrder: 4,
//     },
//     {
//       question: 'How do I list my products or services?',
//       answer: 'After your account is verified, log in to your dashboard and navigate to "My Listings". Click "Add Product" or "Add Service", fill in the required information including photos, pricing (fixed, negotiable, or both), and description, then submit.',
//       category: 'products',
//       targetAudience: 'members',
//       isVisible: true,
//       isFeatured: true,
//       displayOrder: 5,
//     },
//     {
//       question: 'How do I reset my password?',
//       answer: 'If you forgot your password, click on "Forgot Password" on the login page and submit your phone number. An admin will process your request and send you a temporary password which you must change on first login.',
//       category: 'account',
//       targetAudience: 'all',
//       isVisible: true,
//       displayOrder: 6,
//     },
//     {
//       question: 'Can I list tools for lease on the platform?',
//       answer: 'Yes! Members can list their tools for sale, lease, or both. Navigate to "My Tools" in your dashboard, add your tool with details about condition, pricing, and availability, and publish it.',
//       category: 'tools',
//       targetAudience: 'members',
//       isVisible: true,
//       displayOrder: 7,
//     },
//     {
//       question: 'How do I contact a farmer or artisan?',
//       answer: 'When viewing a member\'s profile or listing, you will see their contact information including phone number and location. You can contact them directly to discuss products, services, or business opportunities.',
//       category: 'general',
//       targetAudience: 'clients',
//       isVisible: true,
//       displayOrder: 8,
//     },
//   ];

//   for (const faq of faqs) {
//     await prisma.fAQ.create({
//       data: faq,
//     });
//   }

//   console.log(`✅ Created ${faqs.length} FAQs`);

//   // ============================================================================
//   // 15. SAMPLE SPONSOR/PARTNER
//   // ============================================================================
//   console.log('\n🤝 Creating Sample Sponsors/Partners...');

//   await prisma.sponsorPartner.create({
//     data: {
//       organizationName: 'Kaduna State Ministry of Agriculture',
//       type: 'PARTNER',
//       category: 'GOVERNMENT_AGENCY',
//       description: 'State government agency supporting agricultural development and farmer empowerment programs.',
//       partnershipSince: new Date('2024-01-01'),
//       isOngoing: true,
//       areasOfSupport: ['Training', 'Policy Advocacy', 'Market Access'],
//       isActive: true,
//       isFeatured: true,
//       showOnAboutPage: true,
//       displayOrder: 1,
//     },
//   });

//   await prisma.sponsorPartner.create({
//     data: {
//       organizationName: 'Agricultural Development Foundation',
//       type: 'SPONSOR',
//       category: 'NON_GOVERNMENTAL_ORGANIZATION',
//       description: 'NGO supporting smallholder farmers with training and resources.',
//       partnershipSince: new Date('2024-06-01'),
//       isOngoing: true,
//       sponsorshipLevel: 'Gold',
//       areasOfSupport: ['Funding', 'Capacity Building'],
//       isActive: true,
//       isFeatured: false,
//       showOnAboutPage: true,
//       displayOrder: 2,
//     },
//   });

//   console.log('✅ Created 2 sample sponsors/partners');

//   // ============================================================================
//   // SEEDING COMPLETE
//   // ============================================================================

//   console.log('\n🎉 ============================================');
//   console.log('🎉 ROOTAF FOUNDATION DATABASE SEEDING COMPLETE!');
//   console.log('🎉 ============================================\n');

//   console.log('📊 Summary:');
//   console.log(`   ✅ ${statesData.length} Nigerian States with full LGAs`);
//   console.log(`   ✅ ${objectives.length} Foundation Objectives`);
//   console.log('   ✅ 4 Admin Users');
//   console.log('   ✅ 4 Leadership Profiles');
//   console.log('   ✅ 4 About Page Sections');
//   console.log('   ✅ 14 Sample Categories');
//   console.log('   ✅ 5 Test Users (2 Farmers, 1 Artisan, 1 Both, 1 Client)');
//   console.log('   ✅ 2 Sample Testimonials');
//   console.log('   ✅ 2 Sample Events with Agenda');
//   console.log(`   ✅ ${systemSettings.length} System Settings`);
//   console.log(`   ✅ ${faqs.length} FAQs`);
//   console.log('   ✅ 2 Sample Sponsors/Partners');

//   console.log('\n🔐 Default Credentials:');
//   console.log('   ┌─────────────────────────────────────────────────┐');
//   console.log('   │ ADMIN ACCOUNTS                                  │');
//   console.log('   ├─────────────────────────────────────────────────┤');
//   console.log('   │ Super Admin:        superadmin / ROOTAF@2025!   │');
//   console.log('   │ Legal Affairs:      legal_affairs / Legal@ROOTAF2025 │');
//   console.log('   │ ICT Head:           ict_head / ICT@ROOTAF2025   │');
//   console.log('   │ Verification Admin: verification_admin / Verify@ROOTAF2025 │');
//   console.log('   ├─────────────────────────────────────────────────┤');
//   console.log('   │ TEST USER ACCOUNTS                              │');
//   console.log('   ├─────────────────────────────────────────────────┤');
//   console.log('   │ Test Farmer:        08012345678 / TestFarmer123 │');
//   console.log('   │ Test Artisan:       08098765432 / TestArtisan123│');
//   console.log('   │ Test Both:          08066666666 / TestBoth123   │');
//   console.log('   │ Test Client:        08055555555 / TestClient123 │');
//   console.log('   │ Pending Member:     08077777777 / PendingMember123 │');
//   console.log('   └─────────────────────────────────────────────────┘');

//   console.log('\n🌱 ROOTAF is a beacon of life.');
//   console.log('   May Allah grant ROOTAF increased wisdom, guidance, and success,');
//   console.log('   and bless its members with unity, strength, and brotherhood as one family. Ameen.');
//   console.log('   Rooted to Rise — from the root, we rise; no matter the soil, we grow. 🌱\n');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Error during seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedToolCategories } from './tool-categories.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  await seedToolCategories();

  // ... your other seed functions ...

  console.log('\n🌱 Seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });