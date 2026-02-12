/**
 * Terms and Conditions content for KONEK – English and Tagalog.
 * Used by TermsAcceptanceModal (first sign-in) and LegalPage (standalone view).
 */

export const TERMS_STORAGE_KEY_PREFIX = 'konek_terms_accepted_';

export function hasUserAcceptedTerms(userId) {
  if (!userId) return false;
  try {
    return localStorage.getItem(TERMS_STORAGE_KEY_PREFIX + userId) === 'true';
  } catch {
    return false;
  }
}

export function setUserAcceptedTerms(userId) {
  if (!userId) return;
  try {
    localStorage.setItem(TERMS_STORAGE_KEY_PREFIX + userId, 'true');
  } catch (_) {}
}

// --- English ---
export const TERMS_EN = {
  title: 'Terms and Conditions (English)',
  sections: [
    { heading: 'Acceptance of Terms', body: 'By accessing, logging into, or using the KOmunidad Network for Kalusugan (KONEK) Health Information System, the user acknowledges that they have read, understood, and agreed to comply with these Terms and Conditions. Users who do not agree with these terms must refrain from using the system.' },
    { heading: 'Purpose and Scope', body: 'KONEK is a barangay-based Health Information System (HIS) developed to support the collection, management, monitoring and reporting of maternal and public health data within Batangas City. The system aims to enhance service delivery, continuity of care, and health program monitoring in coordination with the City Health Office (CHO) and Rural Health Units (RHUs). The system is intended solely for official public health, clinical and administrative purposes.' },
    { heading: 'Authorized Access and Users', body: 'Access to KONEK is restricted to duly authorized personnel, including but not limited to: Midwives assigned to RHUs; Authorized City Health Office personnel; Designated system administrators. Users are responsible for maintaining the confidentiality of their log in credentials and must not permit unauthorized access to the system.' },
    { heading: 'User Obligations', body: 'Authorized users agree to: Ensure accuracy, completeness and timeliness of all data entered into the system. Use KONEK exclusively for legitimate health-related functions. Protect the confidentiality of patient and system information. Comply with applicable laws, policies and ethical standards. Any misuse, unauthorized disclosure, alteration, or falsification of data may result in administrative action, including suspension or termination of system access.' },
    { heading: 'Prohibited Activities', body: 'Users shall not: Access records beyond their assigned role or authority; Share log in credentials or impersonate another user; Alter, delete, or falsify records without proper authorization; Use the system for personal, commercial, or non-official purposes; Attempt to compromise system security or functionality. Violations may result in immediate suspension or termination of access.' },
    { heading: 'Account Administration', body: 'System administrators reserve the right to: Create, modify, suspend, or deactivate user accounts; Assign or restrict access privileges based on role and responsibility; Conduct audits or reviews of system usage when necessary. User access may be revoked for policy violations or security concerns.' },
    { heading: 'System Availability', body: 'KONEK operates strictly in online mode and requires an active internet connection to access and use the system. While reasonable efforts are made to ensure system reliability, uninterrupted access is not guaranteed. The system administrators shall not be held liable for service interruptions, data delays or losses arising from technical issues, connectivity limitations or improper system use.' },
    { heading: 'Limitation of Liability', body: 'KONEK is provided on an "as is" basis. The developers, administrators and managing institutions shall not be liable for: Errors resulting from incorrect data entry; Decisions made based on system-generated outputs; Losses resulting from unauthorized use of user credentials. Users remain accountable for actions performed under their assigned accounts.' },
    { heading: 'Amendments', body: 'These Terms and Conditions may be updated or revised at any time. Continued use of the system after such changes constitutes acceptance of the revised terms.' },
  ],
  acknowledgment: 'I have read, understood, and agree to the Terms and Conditions of Use.',
};

// --- Tagalog ---
export const TERMS_TL = {
  title: 'Mga Tuntunin at Kondisyon (Filipino)',
  sections: [
    { heading: 'Pagtanggap sa mga Tuntunin', body: 'Sa pag-access, pag-log in, o paggamit ng KOmunidad Network for Kalusugan (KONEK) Health Information System, kinikilala ng gumagamit na kanilang nabasa, naunawaan, at sinasang-ayunan na sumunod sa mga Tuntunin at Kondisyon na ito. Ang mga gumagamit na hindi sumasang-ayon sa mga tuntuning ito ay kinakailangang umiwas sa paggamit ng sistema.' },
    { heading: 'Layunin at Saklaw', body: 'Ang KONEK ay isang barangay-based Health Information System (HIS) na binuo upang suportahan ang pangangalap, pamamahala, pagsubaybay, at pag-uulat ng datos sa kalusugan ng mga ina at pampublikong kalusugan sa loob ng Lungsod ng Batangas. Nilalayon ng sistema na mapabuti ang paghahatid ng serbisyong pangkalusugan, pagpapatuloy ng pangangalaga, at pagsubaybay ng mga programang pangkalusugan sa pakikipag-ugnayan sa City Health Office (CHO) at mga Rural Health Unit (RHU). Ang sistema ay naglalayong gamitin lamang para sa opisyal na layuning pampublikong kalusugan, klinikal, at administratibo.' },
    { heading: 'Awtorisadong Access at mga Gumagamit', body: 'Ang access sa KONEK ay limitado lamang sa mga duly authorized na kawani, kabilang ngunit hindi limitado sa: Mga Midwives na nakatalaga sa mga RHU; Awtorisadong kawani ng City Health Office; Itinalagang mga system administrator. Ang mga gumagamit ay may pananagutan sa pagpapanatili ng pagiging kumpidensyal ng kanilang mga log in credentials at hindi dapat pahintulutan ang hindi awtorisadong pag-access sa sistema.' },
    { heading: 'Mga Obligasyon ng Gumagamit', body: 'Sumasang-ayon ang mga awtorisadong gumagamit na: Tiyakin ang wasto, kumpleto, at pagiging napapanahon ng lahat ng datos na ipinasok sa sistema. Gamitin ang KONEK eksklusibo para sa lehitimong tungkuling may kaugnayan sa kalusugan. Pangalagaan ang pagiging kumpidensyal ng impormasyon ng pasyente at ng sistema. Sumunod sa mga umiiral na batas, patakaran, at pamantayang etikal. Ang anumang maling paggamit, hindi awtorisadong pagbubunyag, pagbabago, o pamemeke ng datos ay maaaring magresulta sa administratibong aksyon, kabilang ang pansamantala o tuluyang pagtanggal ng access sa sistema.' },
    { heading: 'Mga Ipinagbabawal na Gawain', body: 'Hindi pinahihintulutan ang mga gumagamit na: Mag-access ng mga rekord na lampas sa kanilang itinalagang tungkulin. Ibahagi ang log in credentials o magpanggap bilang ibang gumagamit. Magbago, magbura, o magpeke ng mga rekord nang walang wastong pahintulot. Gamitin ang sistema para sa personal, komersyal, o hindi opisyal na layunin. Subukang sirain o pakialaman ang seguridad o paggana ng sistema. Ang mga paglabag ay maaaring magresulta sa agarang suspensyon o tuluyang pagtanggal ng access.' },
    { heading: 'Pamamahala ng Account', body: 'Ang mga system administrator ay may karapatang: Lumikha, magbago, magsuspinde, o mag-deactivate ng mga user account; Magtalaga o maglimita ng mga pribilehiyo sa access batay sa tungkulin at responsibilidad; Magsagawa ng audit o pagsusuri ng paggamit ng sistema kung kinakailangan. Maaaring bawiin ang access ng gumagamit dahil sa paglabag sa patakaran o sa seguridad.' },
    { heading: 'Availability ng Sistema', body: 'Ang KONEK ay gumagana nang strictly sa online mode at nangangailangan ng aktibong koneksyon sa internet upang ma-access at magamit ang sistema. Bagama\'t nagsasagawa ng makatuwirang hakbang upang matiyak ang pagiging maaasahan ng sistema, hindi ginagarantiyahan ang tuloy-tuloy at walang patid na access. Hindi mananagot ang mga system administrator sa mga pagkaantala ng serbisyo, pagkaantala o pagkawala ng datos na dulot ng mga teknikal na isyu, limitasyon sa koneksyon, o hindi wastong paggamit ng sistema.' },
    { heading: 'Limitasyon ng Pananagutan', body: 'Ang KONEK ay ibinibigay sa kondisyong "as is". Ang mga developer, administrator, at mga namamahalang institusyon ay hindi mananagot sa: Mga error na nagmula sa maling pagpasok ng datos; Mga desisyong ginawa batay sa mga output na nalikha ng sistema; Mga pagkawala ng datos na dulot ng hindi awtorisadong paggamit ng log in credentials. Nanatiling may pananagutan ang mga gumagamit sa lahat ng aksyong isinagawa gamit ang kanilang itinalagang account.' },
    { heading: 'Mga Pagbabago', body: 'Ang mga Tuntunin at Kondisyon na ito ay maaaring baguhin o i-update anumang oras. Ang patuloy na paggamit ng sistema matapos ang mga pagbabagong ito ay nangangahulugang pagtanggap sa mga binagong tuntunin.' },
  ],
  acknowledgment: 'Aking nabasa, naunawaan, at sinasang-ayunan ang mga Tuntunin at Kondisyon ng Paggamit.',
};
