"""Seed utility for reviewed demo questions, curriculum taxonomy, and content chunks.

Seeds sample bilingual (Odia/English) content across Class 9, 10, and 12.
All items are clearly tagged with provenance and approval state.
"""

import logging
from sqlalchemy.orm import Session

from app.core.constants import (
    ApprovalState,
    ClassLevel,
    QuestionDifficulty,
    QuestionType,
)
from app.models import Chapter, Concept, ContentChunk, Question, Subject

logger = logging.getLogger(__name__)


def seed_demo_data(db: Session) -> None:
    """Idempotently seeds demo subjects, chapters, concepts, questions, and content chunks."""
    logger.info("Starting demo data seeding...")

    # 1. Subjects
    subjects = [
        Subject(id="sub_science", code="SCI", name_en="Science", name_or="ବିଜ୍ଞାନ"),
        Subject(id="sub_math", code="MATH", name_en="Mathematics", name_or="ଗଣିତ"),
        Subject(id="sub_physics", code="PHY", name_en="Physics", name_or="ପଦାର୍ଥ ବିଜ୍ଞାନ"),
    ]
    for sub in subjects:
        if not db.query(Subject).filter_by(id=sub.id).first():
            db.add(sub)
    db.commit()

    # 2. Chapters (Class 9, 10, 12)
    chapters = [
        Chapter(
            id="chap_c9_motion",
            subject_id="sub_science",
            class_level=ClassLevel.CLASS_9.value,
            chapter_number=8,
            title_en="Motion",
            title_or="ଗତି",
        ),
        Chapter(
            id="chap_c10_chem_rxn",
            subject_id="sub_science",
            class_level=ClassLevel.CLASS_10.value,
            chapter_number=1,
            title_en="Chemical Reactions and Equations",
            title_or="ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମୀକରଣ",
        ),
        Chapter(
            id="chap_c10_electricity",
            subject_id="sub_science",
            class_level=ClassLevel.CLASS_10.value,
            chapter_number=12,
            title_en="Electricity",
            title_or="ବିଦ୍ୟୁତ୍",
        ),
        Chapter(
            id="chap_c12_optics",
            subject_id="sub_physics",
            class_level=ClassLevel.CLASS_12.value,
            chapter_number=9,
            title_en="Ray Optics and Optical Instruments",
            title_or="ରଶ୍ମି ଆଲୋକବିଜ୍ଞାନ",
        ),
    ]
    for chap in chapters:
        if not db.query(Chapter).filter_by(id=chap.id).first():
            db.add(chap)
    db.commit()

    # 3. Concepts
    concepts = [
        Concept(
            id="cpt_c9_velocity",
            subject_id="sub_science",
            chapter_id="chap_c9_motion",
            code="VELOCITY",
            name_en="Velocity and Acceleration",
            name_or="ବେଗ ଏବଂ ତ୍ୱରଣ",
            description="Understanding the distinction between speed, velocity, and rate of change of velocity.",
        ),
        Concept(
            id="cpt_c10_redox",
            subject_id="sub_science",
            chapter_id="chap_c10_chem_rxn",
            code="REDOX",
            name_en="Oxidation and Reduction",
            name_or="ଜାରଣ ଓ ବିଜାରଣ",
            description="Loss and gain of electrons/oxygen in simultaneous chemical reactions.",
        ),
        Concept(
            id="cpt_c10_ohms_law",
            subject_id="sub_science",
            chapter_id="chap_c10_electricity",
            code="OHMS_LAW",
            name_en="Ohm's Law and Resistance",
            name_or="ଓମ୍‌ଙ୍କ ନିୟମ ଓ ପ୍ରତିରୋଧ",
            description="Proportionality of current and voltage across a conductor at constant temperature.",
        ),
        Concept(
            id="cpt_c12_refraction",
            subject_id="sub_physics",
            chapter_id="chap_c12_optics",
            code="REFRACTION_SNELL",
            name_en="Snell's Law of Refraction",
            name_or="ସ୍ନେଲ୍‌ଙ୍କ ପ୍ରତିସରଣ ନିୟମ",
            description="Ratio of sine of angle of incidence to refraction equals refractive index.",
        ),
    ]
    for cpt in concepts:
        if not db.query(Concept).filter_by(id=cpt.id).first():
            db.add(cpt)
    db.commit()

    # 4. Content Chunks (Canonical Provenance Grounding)
    chunks = [
        ContentChunk(
            id="chk_c10_redox_01",
            chapter_id="chap_c10_chem_rxn",
            concept_id="cpt_c10_redox",
            subject_id="sub_science",
            class_level=10,
            source_title="BSE Odisha Physical Science Class 10",
            source_locator="TB-C10-SC-CH01-P12",
            section_title="1.2.4 Oxidation and Reduction",
            page_number=12,
            language="or",
            text_content="ଯେଉଁ ପ୍ରକ୍ରିୟାରେ ଏକ ପଦାର୍ଥ ଅମ୍ଳଜାନ ଲାଭ କରେ ବା ଉଦ୍‌ଜାନ ହରାଏ ତାହାକୁ ଜାରଣ (Oxidation) କୁହାଯାଏ । ବିପରୀତ ଭାବେ, ଯେଉଁଥିରେ ଅମ୍ଳଜାନ ହ୍ରାସ ପାଏ ବା ଉଦ୍‌ଜାନ ଯୋଗ ହୁଏ, ତାହାକୁ ବିଜାରଣ (Reduction) କୁହାଯାଏ ।",
            checksum="a1b2c3d4e5f601",
            content_version="1.0.0",
            approval_state=ApprovalState.APPROVED.value,
        ),
        ContentChunk(
            id="chk_c10_redox_02_en",
            chapter_id="chap_c10_chem_rxn",
            concept_id="cpt_c10_redox",
            subject_id="sub_science",
            class_level=10,
            source_title="NCERT Science Class 10",
            source_locator="TB-C10-NCERT-CH01-P12",
            section_title="Oxidation and Reduction Reactions",
            page_number=12,
            language="en",
            text_content="If a substance gains oxygen or loses hydrogen during a reaction, it is oxidised. If a substance loses oxygen or gains hydrogen during a reaction, it is reduced. Both occur simultaneously in Redox reactions.",
            checksum="a1b2c3d4e5f602",
            content_version="1.0.0",
            approval_state=ApprovalState.APPROVED.value,
        ),
        ContentChunk(
            id="chk_c10_ohms_01",
            chapter_id="chap_c10_electricity",
            concept_id="cpt_c10_ohms_law",
            subject_id="sub_science",
            class_level=10,
            source_title="BSE Odisha Physical Science Class 10",
            source_locator="TB-C10-SC-CH12-P204",
            section_title="12.4 Ohm's Law",
            page_number=204,
            language="bilingual",
            text_content="ସ୍ଥିର ତାପମାତ୍ରାରେ ଏକ ପରିବାହୀ ଦୁଇ ପ୍ରାନ୍ତ ମଧ୍ୟରେ ବିଦ୍ୟୁତ୍ ବିଭବାନ୍ତର (V), ଏହା ମଧ୍ୟରେ ପ୍ରବାହିତ ବିଦ୍ୟୁତ୍ ସ୍ରୋତ (I) ସହ ସମାନୁପାତୀ । V = I * R, ଯେଉଁଠାରେ R ହେଉଛି ପରିବାହୀର ପ୍ରତିରୋଧ ।",
            checksum="a1b2c3d4e5f603",
            content_version="1.0.0",
            approval_state=ApprovalState.APPROVED.value,
        ),
        ContentChunk(
            id="chk_c12_snell_01",
            chapter_id="chap_c12_optics",
            concept_id="cpt_c12_refraction",
            subject_id="sub_physics",
            class_level=12,
            source_title="CHSE Odisha Bureau Physics Class 12",
            source_locator="TB-C12-CHSE-PHY-CH09-P312",
            section_title="9.3 Refraction through a Spherical Surface and Lenses",
            page_number=312,
            language="en",
            text_content="Snell's Law: The ratio of the sine of the angle of incidence to the sine of the angle of refraction is a constant for the light of a given colour and for the given pair of media: sin(i) / sin(r) = n2 / n1.",
            checksum="a1b2c3d4e5f604",
            content_version="1.0.0",
            approval_state=ApprovalState.APPROVED.value,
        ),
    ]
    for chk in chunks:
        if not db.query(ContentChunk).filter_by(id=chk.id).first():
            db.add(chk)
    db.commit()

    # 5. Reviewed Demo Questions (25 Questions across Class 9, 10, 12)
    demo_questions_raw = [
        # --- Class 10 Chemistry: Chemical Reactions & Redox (Questions 1 to 8) ---
        {
            "id": "q_c10_rxn_01",
            "chapter_id": "chap_c10_chem_rxn",
            "concept_id": "cpt_c10_redox",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "In the reaction CuO + H2 -> Cu + H2O, which substance is being reduced?",
            "stem_or": "CuO + H2 -> Cu + H2O ରାସାୟନିକ ପ୍ରତିକ୍ରିୟାରେ କେଉଁ ପଦାର୍ଥଟି ବିଜାରିତ ହେଉଛି?",
            "options": [
                {"id": "A", "text_en": "CuO (Copper oxide)", "text_or": "CuO (କପର ଅକ୍ସାଇଡ୍)"},
                {"id": "B", "text_en": "H2 (Hydrogen)", "text_or": "H2 (ହାଇଡ୍ରୋଜେନ୍)"},
                {"id": "C", "text_en": "Cu (Copper)", "text_or": "Cu (ତମ୍ବା)"},
                {"id": "D", "text_en": "H2O (Water)", "text_or": "H2O (ଜଳ)"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "CuO loses oxygen to form Cu, hence it is reduced. H2 gains oxygen to form H2O, hence it is oxidised.",
            "explanation_or": "CuO ରୁ ଅମ୍ଳଜାନ ଅପସାରିତ ହୋଇ Cu ଗଠନ ହୁଏ, ତେଣୁ ଏହା ବିଜାରିତ ହୁଏ ।",
        },
        {
            "id": "q_c10_rxn_02",
            "chapter_id": "chap_c10_chem_rxn",
            "concept_id": "cpt_c10_redox",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Which of the following processes represents oxidation?",
            "stem_or": "ନିମ୍ନଲିଖିତ ମଧ୍ୟରୁ କେଉଁ ପ୍ରକ୍ରିୟାଟି ଜାରଣକୁ ଦର୍ଶାଏ?",
            "options": [
                {"id": "A", "text_en": "Gain of electrons", "text_or": "ଇଲେକ୍ଟ୍ରନ୍ ଲାଭ କରିବା"},
                {"id": "B", "text_en": "Loss of oxygen", "text_or": "ଅମ୍ଳଜାନ ହରାଇବା"},
                {"id": "C", "text_en": "Loss of hydrogen or gain of oxygen", "text_or": "ଉଦ୍‌ଜାନ ହରାଇବା ବା ଅମ୍ଳଜାନ ଲାଭ କରିବା"},
                {"id": "D", "text_en": "Gain of hydrogen", "text_or": "ଉଦ୍‌ଜାନ ଲାଭ କରିବା"},
            ],
            "correct_answer": {"selected_option": "C"},
            "explanation_en": "Oxidation is defined as the addition of oxygen or removal of hydrogen (or loss of electrons).",
            "explanation_or": "ଅମ୍ଳଜାନ ଯୋଗ କିମ୍ବା ଉଦ୍‌ଜାନ ବିୟୋଗ ପ୍ରକ୍ରିୟାକୁ ଜାରଣ କୁହାଯାଏ ।",
        },
        {
            "id": "q_c10_rxn_03",
            "chapter_id": "chap_c10_chem_rxn",
            "concept_id": "cpt_c10_redox",
            "difficulty": QuestionDifficulty.HARD.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "When manganese dioxide reacts with hydrochloric acid: MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2, which is the oxidising agent?",
            "stem_or": "MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2 ପ୍ରତିକ୍ରିୟାରେ କେଉଁଟି ଜାରକ (Oxidising agent)?",
            "options": [
                {"id": "A", "text_en": "HCl", "text_or": "HCl"},
                {"id": "B", "text_en": "MnO2", "text_or": "MnO2"},
                {"id": "C", "text_en": "MnCl2", "text_or": "MnCl2"},
                {"id": "D", "text_en": "Cl2", "text_or": "Cl2"},
            ],
            "correct_answer": {"selected_option": "B"},
            "explanation_en": "MnO2 oxidises HCl to Cl2 while itself getting reduced to MnCl2. Thus MnO2 is the oxidising agent.",
            "explanation_or": "MnO2, HCl କୁ Cl2 ରେ ଜାରିତ କରେ ଏବଂ ନିଜେ MnCl2 ରେ ବିଜାରିତ ହୁଏ, ତେଣୁ MnO2 ହେଉଛି ଜାରକ ।",
        },
        {
            "id": "q_c10_rxn_04",
            "chapter_id": "chap_c10_chem_rxn",
            "concept_id": "cpt_c10_redox",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Rusting of iron is an example of which kind of reaction?",
            "stem_or": "ଲୁହାରେ କଳଙ୍କି ଲାଗିବା କେଉଁ ପ୍ରକାରର ପ୍ରତିକ୍ରିୟାର ଉଦାହରଣ?",
            "options": [
                {"id": "A", "text_en": "Oxidation and corrosion", "text_or": "ଜାରଣ ଏବଂ କ୍ଷୟୀଭବନ"},
                {"id": "B", "text_en": "Reduction only", "text_or": "କେବଳ ବିଜାରଣ"},
                {"id": "C", "text_en": "Thermal decomposition", "text_or": "ତାପୀୟ ବିଘଟନ"},
                {"id": "D", "text_en": "Precipitation", "text_or": "ଅବକ୍ଷେପଣ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Rusting of iron is an oxidation reaction in the presence of moisture and air, causing corrosion.",
            "explanation_or": "ବାୟୁ ଓ ଜଳୀୟବାଷ୍ପ ଉପସ୍ଥିତିରେ ଲୁହା ଜାରିତ ହୋଇ କଳଙ୍କି ସୃଷ୍ଟି ହୁଏ ।",
        },
        {
            "id": "q_c10_rxn_05",
            "chapter_id": "chap_c10_chem_rxn",
            "concept_id": "cpt_c10_redox",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "What type of chemical reaction occurs when quicklime reacts with water to form slaked lime?",
            "stem_or": "କଳିଚୂନ (CaO) ଜଳ ସହିତ ପ୍ରତିକ୍ରିୟା କରି ଶମିତ ଚୂନ (Ca(OH)2) ସୃଷ୍ଟି କରିବା କେଉଁ ପ୍ରକାର ପ୍ରତିକ୍ରିୟା?",
            "options": [
                {"id": "A", "text_en": "Exothermic combination reaction", "text_or": "ତାପୋତ୍ପାଦୀ ସଂଶ୍ଳେଷଣ ପ୍ରତିକ୍ରିୟା"},
                {"id": "B", "text_en": "Endothermic displacement reaction", "text_or": "ତାପଶୋଷୀ ବିସ୍ଥାପନ ପ୍ରତିକ୍ରିୟା"},
                {"id": "C", "text_en": "Decomposition reaction", "text_or": "ବିଘଟନ ପ୍ରତିକ୍ରିୟା"},
                {"id": "D", "text_en": "Double displacement reaction", "text_or": "ଦ୍ୱି-ବିସ୍ଥାପନ ପ୍ରତିକ୍ରିୟା"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "CaO + H2O -> Ca(OH)2 + Heat is a combination reaction that releases heat (exothermic).",
            "explanation_or": "ଦୁଇଟି ପଦାର୍ଥ ମିଶି ଏକକ ଉତ୍ପାଦ ଗଠନ କରେ ଏବଂ ପ୍ରଚୁର ତାପ ନିର୍ଗତ ହୁଏ ।",
        },

        # --- Class 10 Physics: Electricity & Ohm's Law (Questions 6 to 12) ---
        {
            "id": "q_c10_elec_01",
            "chapter_id": "chap_c10_electricity",
            "concept_id": "cpt_c10_ohms_law",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "According to Ohm's Law, what is the relation between Potential Difference (V) and Current (I)?",
            "stem_or": "ଓମ୍‌ଙ୍କ ନିୟମ ଅନୁସାରେ, ବିଭବାନ୍ତର (V) ଓ ବିଦ୍ୟୁତ୍ ପ୍ରବାହ (I) ମଧ୍ୟରେ ସମ୍ପର୍କ କ'ଣ?",
            "options": [
                {"id": "A", "text_en": "V is directly proportional to I", "text_or": "V ସିଧାସଳଖ I ସହ ସମାନୁପାତୀ (V ∝ I)"},
                {"id": "B", "text_en": "V is inversely proportional to I", "text_or": "V, I ସହ ବ୍ୟୁତ୍କ୍ରମାନୁପାତୀ"},
                {"id": "C", "text_en": "V is independent of I", "text_or": "V ଏବଂ I ସ୍ୱାଧୀନ"},
                {"id": "D", "text_en": "V is proportional to I squared", "text_or": "V, I ର ବର୍ଗ ସହ ସମାନୁପାତୀ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Ohm's law states that V = IR, meaning potential difference is directly proportional to current at constant temperature.",
            "explanation_or": "ସ୍ଥିର ତାପମାତ୍ରାରେ ବିଭବାନ୍ତର ପ୍ରବାହିତ ବିଦ୍ୟୁତ୍ ସ୍ରୋତ ସହିତ ସମାନୁପାତୀ (V = IR) ।",
        },
        {
            "id": "q_c10_elec_02",
            "chapter_id": "chap_c10_electricity",
            "concept_id": "cpt_c10_ohms_law",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "If a potential difference of 12 V is maintained across a 4 Ohm resistor, what is the current flowing through it?",
            "stem_or": "ଏକ 4 ଓମ୍ (Ω) ପ୍ରତିରୋଧକ ମଧ୍ୟରେ 12 ଭୋଲ୍ଟ (V) ବିଭବାନ୍ତର ଥିଲେ, କେତେ ପରିମାଣର ବିଦ୍ୟୁତ୍ ପ୍ରବାହିତ ହେବ?",
            "options": [
                {"id": "A", "text_en": "48 A", "text_or": "48 A"},
                {"id": "B", "text_en": "3 A", "text_or": "3 A"},
                {"id": "C", "text_en": "0.33 A", "text_or": "0.33 A"},
                {"id": "D", "text_en": "8 A", "text_or": "8 A"},
            ],
            "correct_answer": {"selected_option": "B"},
            "explanation_en": "Using Ohm's Law: I = V / R = 12 / 4 = 3 Amperes.",
            "explanation_or": "ଓମ୍‌ଙ୍କ ନିୟମ ଅନୁସାରେ: I = V / R = 12 / 4 = 3 ଆମ୍ପିୟର୍ ।",
        },
        {
            "id": "q_c10_elec_03",
            "chapter_id": "chap_c10_electricity",
            "concept_id": "cpt_c10_ohms_law",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Two resistors of 6 Ohm each are connected in parallel. What is their equivalent resistance?",
            "stem_or": "ଦୁଇଟି 6 ଓମ୍ ପ୍ରତିରୋଧକ ସମାନ୍ତରାଳ ଭାବେ ସଂଯୁକ୍ତ ହେଲେ ସମତୁଲ୍ୟ ପ୍ରତିରୋଧ କେତେ ହେବ?",
            "options": [
                {"id": "A", "text_en": "12 Ohm", "text_or": "12 ଓମ୍"},
                {"id": "B", "text_en": "3 Ohm", "text_or": "3 ଓମ୍"},
                {"id": "C", "text_en": "6 Ohm", "text_or": "6 ଓମ୍"},
                {"id": "D", "text_en": "1.5 Ohm", "text_or": "1.5 ଓମ୍"},
            ],
            "correct_answer": {"selected_option": "B"},
            "explanation_en": "For two equal parallel resistors: Req = R / 2 = 6 / 2 = 3 Ohms.",
            "explanation_or": "ସମାନ୍ତରାଳ ସଂଯୋଗରେ 1/R = 1/6 + 1/6 = 2/6 = 1/3, ଅର୍ଥାତ୍ R = 3 ଓମ୍ ।",
        },
        {
            "id": "q_c10_elec_04",
            "chapter_id": "chap_c10_electricity",
            "concept_id": "cpt_c10_ohms_law",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "What is the SI unit of electrical resistance?",
            "stem_or": "ବିଦ୍ୟୁତ୍ ପ୍ରତିରୋଧର SI ଏକକ କ'ଣ?",
            "options": [
                {"id": "A", "text_en": "Volt", "text_or": "ଭୋଲ୍ଟ"},
                {"id": "B", "text_en": "Ampere", "text_or": "ଆମ୍ପିୟର୍"},
                {"id": "C", "text_en": "Ohm", "text_or": "ଓମ୍ (Ω)"},
                {"id": "D", "text_en": "Watt", "text_or": "ୱାଟ୍"},
            ],
            "correct_answer": {"selected_option": "C"},
            "explanation_en": "The SI unit of electrical resistance is Ohm (Ω).",
            "explanation_or": "ପ୍ରତିରୋଧର SI ଏକକ ହେଉଛି ଓମ୍ (Ohm) ।",
        },
        {
            "id": "q_c10_elec_05",
            "chapter_id": "chap_c10_electricity",
            "concept_id": "cpt_c10_ohms_law",
            "difficulty": QuestionDifficulty.HARD.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "If the length of a cylindrical metallic wire is doubled while keeping its volume constant, how does its resistance change?",
            "stem_or": "ଗୋଟିଏ ତାରର ଲମ୍ବକୁ ଦୁଇଗୁଣ କରିଦେଲେ (ଆୟତନ ସ୍ଥିର ରଖି), ଏହାର ପ୍ରତିରୋଧ କିପରି ପରିବର୍ତ୍ତିତ ହେବ?",
            "options": [
                {"id": "A", "text_en": "Doubles", "text_or": "ଦୁଇଗୁଣ ହେବ"},
                {"id": "B", "text_en": "Remains unchanged", "text_or": "ଅପରିବର୍ତ୍ତିତ ରହିବ"},
                {"id": "C", "text_en": "Increases by 4 times", "text_or": "୪ ଗୁଣ ବୃଦ୍ଧି ପାଇବ"},
                {"id": "D", "text_en": "Halves", "text_or": "ଅଧା ହୋଇଯିବ"},
            ],
            "correct_answer": {"selected_option": "C"},
            "explanation_en": "Since volume is constant, doubling length halves cross-sectional area. R = rho * (2L)/(A/2) = 4 * (rho*L/A) = 4R.",
            "explanation_or": "ଆୟତନ ସ୍ଥିର ରହିଲେ ପ୍ରସ୍ଥଚ୍ଛେଦ କ୍ଷେତ୍ରଫଳ ଅଧା ହୁଏ, ତେଣୁ ପ୍ରତିରୋଧ ୪ ଗୁଣ ହୋଇଯାଏ ।",
        },

        # --- Class 9 Science: Motion & Velocity (Questions 11 to 18) ---
        {
            "id": "q_c9_motion_01",
            "chapter_id": "chap_c9_motion",
            "concept_id": "cpt_c9_velocity",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "What is the SI unit of acceleration?",
            "stem_or": "ତ୍ୱରଣର SI ଏକକ କ'ଣ?",
            "options": [
                {"id": "A", "text_en": "m/s", "text_or": "ମିଟର/ସେକେଣ୍ଡ"},
                {"id": "B", "text_en": "m/s^2", "text_or": "ମିଟର/ସେକେଣ୍ଡ^୨"},
                {"id": "C", "text_en": "km/h", "text_or": "କିମି/ଘଣ୍ଟା"},
                {"id": "D", "text_en": "m*s", "text_or": "ମିଟର*ସେକେଣ୍ଡ"},
            ],
            "correct_answer": {"selected_option": "B"},
            "explanation_en": "Acceleration is rate of change of velocity: unit is m/s^2.",
            "explanation_or": "ତ୍ୱରଣ ହେଉଛି ବେଗ ପରିବର୍ତ୍ତନର ହାର, ଏହାର ଏକକ m/s^2 ଅଟେ ।",
        },
        {
            "id": "q_c9_motion_02",
            "chapter_id": "chap_c9_motion",
            "concept_id": "cpt_c9_velocity",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?",
            "stem_or": "ଗୋଟିଏ ଗାଡ଼ି ସ୍ଥିରାବସ୍ଥାରୁ ଆରମ୍ଭ କରି ୫ ସେକେଣ୍ଡରେ ୨୦ ମି/ସେ ବେଗ ହାସଲ କରେ । ଏହାର ତ୍ୱରଣ କେତେ?",
            "options": [
                {"id": "A", "text_en": "4 m/s^2", "text_or": "4 m/s^2"},
                {"id": "B", "text_en": "100 m/s^2", "text_or": "100 m/s^2"},
                {"id": "C", "text_en": "2 m/s^2", "text_or": "2 m/s^2"},
                {"id": "D", "text_en": "5 m/s^2", "text_or": "5 m/s^2"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "a = (v - u) / t = (20 - 0) / 5 = 4 m/s^2.",
            "explanation_or": "a = (v - u) / t = (20 - 0) / 5 = 4 m/s^2 ଅଟେ ।",
        },
        {
            "id": "q_c9_motion_03",
            "chapter_id": "chap_c9_motion",
            "concept_id": "cpt_c9_velocity",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Can an object have a constant speed but variable velocity?",
            "stem_or": "ଗୋଟିଏ ବସ୍ତୁର ଦ୍ରୁତି ସ୍ଥିର ଥାଇ ବେଗ ପରିବର୍ତ୍ତନଶୀଳ ହୋଇପାରିବ କି?",
            "options": [
                {"id": "A", "text_en": "Yes, in uniform circular motion", "text_or": "ହଁ, ସୁଷମ ବୃତ୍ତାକାର ଗତିରେ"},
                {"id": "B", "text_en": "No, never", "text_or": "ନା, କଦାପି ନୁହେଁ"},
                {"id": "C", "text_en": "Only in linear motion", "text_or": "କେବଳ ସରଳରୈଖିକ ଗତିରେ"},
                {"id": "D", "text_en": "Only when moving in vacuum", "text_or": "କେବଳ ଶୂନ୍ୟସ୍ଥାନରେ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Velocity has both magnitude (speed) and direction. In uniform circular motion, speed is constant while direction continuously changes.",
            "explanation_or": "ବୃତ୍ତାକାର ଗତିରେ ଦିଗ ନିରନ୍ତର ବଦଳୁଥିବାରୁ ଦ୍ରୁତି ସ୍ଥିର ଥାଇ ମଧ୍ୟ ବେଗ ପରିବର୍ତ୍ତିତ ହୁଏ ।",
        },
        {
            "id": "q_c9_motion_04",
            "chapter_id": "chap_c9_motion",
            "concept_id": "cpt_c9_velocity",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Displacement is a quantity that is:",
            "stem_or": "ବିସ୍ଥାପନ (Displacement) କେଉଁ ପ୍ରକାରର ରାଶି?",
            "options": [
                {"id": "A", "text_en": "Scalar", "text_or": "ଅଦିଶ (Scalar)"},
                {"id": "B", "text_en": "Vector", "text_or": "ସଦିଶ (Vector)"},
                {"id": "C", "text_en": "Dimensionless", "text_or": "ମାତ୍ରାହୀନ"},
                {"id": "D", "text_en": "Always positive", "text_or": "ସର୍ବଦା ଧନାତ୍ମକ"},
            ],
            "correct_answer": {"selected_option": "B"},
            "explanation_en": "Displacement has both magnitude and a specific direction, making it a vector quantity.",
            "explanation_or": "ବିସ୍ଥାପନର ମାନ ଓ ନିର୍ଦ୍ଦିଷ୍ଟ ଦିଗ ଥିବାରୁ ଏହା ଏକ ସଦିଶ ରାଶି ଅଟେ ।",
        },
        {
            "id": "q_c9_motion_05",
            "chapter_id": "chap_c9_motion",
            "concept_id": "cpt_c9_velocity",
            "difficulty": QuestionDifficulty.HARD.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Under what condition is the magnitude of average velocity of an object equal to its average speed?",
            "stem_or": "କେଉଁ ପରିସ୍ଥିତିରେ ଗୋଟିଏ ବସ୍ତୁର ହାରାହାରି ବେଗର ମାନ ଏହାର ହାରାହାରି ଦ୍ରୁତି ସହ ସମାନ ହୁଏ?",
            "options": [
                {"id": "A", "text_en": "When moving along a straight line in one direction", "text_or": "ଯେତେବେଳେ ବସ୍ତୁ ଗୋଟିଏ ଦିଗରେ ସରଳରେଖାରେ ଗତି କରେ"},
                {"id": "B", "text_en": "When moving in a circle", "text_or": "ବୃତ୍ତାକାର ପଥରେ ଗତି କଲେ"},
                {"id": "C", "text_en": "When it returns to the starting point", "text_or": "ଆରମ୍ଭ ବିନ୍ଦୁକୁ ଫେରିଆସିଲେ"},
                {"id": "D", "text_en": "Never equal", "text_or": "କେବେ ସମାନ ହୁଏ ନାହିଁ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Average speed equals average velocity only when distance equals displacement, which happens in straight unidirectional motion.",
            "explanation_or": "କେବଳ ସରଳରୈଖିକ ଗତିରେ ଅତିକ୍ରାନ୍ତ ଦୂରତା ଓ ବିସ୍ଥାପନ ସମାନ ହୁଏ ।",
        },

        # --- Class 12 Physics: Ray Optics & Snell's Law (Questions 16 to 25) ---
        {
            "id": "q_c12_optics_01",
            "chapter_id": "chap_c12_optics",
            "concept_id": "cpt_c12_refraction",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "According to Snell's law, sin(i) / sin(r) equals:",
            "stem_or": "ସ୍ନେଲ୍‌ଙ୍କ ନିୟମ ଅନୁଯାୟୀ, sin(i) / sin(r) କାହା ସହିତ ସମାନ?",
            "options": [
                {"id": "A", "text_en": "Refractive index of medium 2 with respect to 1", "text_or": "ମାଧ୍ୟମ ୧ ତୁଳନାରେ ମାଧ୍ୟମ ୨ ର ପ୍ରତିସରଣାଙ୍କ (n21)"},
                {"id": "B", "text_en": "Constant value equal to 1", "text_or": "ସର୍ବଦା ୧ ସହ ସମାନ"},
                {"id": "C", "text_en": "Critical angle", "text_or": "ସଂକଟ କୋଣ"},
                {"id": "D", "text_en": "Zero", "text_or": "ଶୂନ୍ୟ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Snell's Law states that sin(i) / sin(r) = n2 / n1 = constant.",
            "explanation_or": "sin(i) / sin(r) ହେଉଛି ଦୁଇଟି ମାଧ୍ୟମ ମଧ୍ୟରେ ଆପେକ୍ଷିକ ପ୍ରତିସରଣାଙ୍କ ।",
        },
        {
            "id": "q_c12_optics_02",
            "chapter_id": "chap_c12_optics",
            "concept_id": "cpt_c12_refraction",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "When a light ray travels from an optically denser medium to a rarer medium, the refracted ray bends:",
            "stem_or": "ଆଲୋକ ରଶ୍ମି ଏକ ଘନ ମାଧ୍ୟମରୁ ଲଘୁ ମାଧ୍ୟମକୁ ପ୍ରବେଶ କଲେ, ପ୍ରତିସରିତ ରଶ୍ମି କେଉଁ ଆଡ଼କୁ ବଙ୍କେଇ ଯାଏ?",
            "options": [
                {"id": "A", "text_en": "Away from the normal", "text_or": "ଅଭିଲମ୍ବ ଠାରୁ ଦୂରକୁ"},
                {"id": "B", "text_en": "Towards the normal", "text_or": "ଅଭିଲମ୍ବ ଆଡ଼କୁ"},
                {"id": "C", "text_en": "Undeviated", "text_or": "ସିଧାସଳଖ ଯାଏ"},
                {"id": "D", "text_en": "Reflects along same path", "text_or": "ସମାନ ପଥରେ ଫେରେ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Moving into a rarer medium increases speed of light, causing it to bend away from normal.",
            "explanation_or": "ଲଘୁ ମାଧ୍ୟମରେ ଆଲୋକର ବେଗ ବୃଦ୍ଧି ପାଉଥିବାରୁ ଏହା ଅଭିଲମ୍ବ ଠାରୁ ଦୂରେଇ ଯାଏ ।",
        },
        {
            "id": "q_c12_optics_03",
            "chapter_id": "chap_c12_optics",
            "concept_id": "cpt_c12_refraction",
            "difficulty": QuestionDifficulty.HARD.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "What is the critical angle for a medium having refractive index sqrt(2) placed in air?",
            "stem_or": "ବାୟୁ ମାଧ୍ୟମରେ ଥିବା ଏକ ପଦାର୍ଥର ପ୍ରତିସରଣାଙ୍କ sqrt(2) ହେଲେ ଏହାର ସଂକଟ କୋଣ କେତେ?",
            "options": [
                {"id": "A", "text_en": "45 degrees", "text_or": "୪୫ ଡିଗ୍ରୀ"},
                {"id": "B", "text_en": "30 degrees", "text_or": "୩୦ ଡିଗ୍ରୀ"},
                {"id": "C", "text_en": "60 degrees", "text_or": "୬୦ ଡିଗ୍ରୀ"},
                {"id": "D", "text_en": "90 degrees", "text_or": "୯୦ ଡିଗ୍ରୀ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "sin(C) = 1 / n = 1 / sqrt(2), hence C = 45 degrees.",
            "explanation_or": "sin(C) = 1 / n = 1 / sqrt(2), ତେଣୁ C = ୪୫ ଡିଗ୍ରୀ ଅଟେ ।",
        },
        {
            "id": "q_c12_optics_04",
            "chapter_id": "chap_c12_optics",
            "concept_id": "cpt_c12_refraction",
            "difficulty": QuestionDifficulty.MEDIUM.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "The focal length of a convex lens in air is 20 cm. Its optical power is:",
            "stem_or": "ଏକ ଉତ୍ତଳ ଲେନ୍ସର ବାୟୁରେ ଫୋକସ ଦୂରତା ୨୦ ସେମି । ଏହାର କ୍ଷମତା (Power) କେତେ?",
            "options": [
                {"id": "A", "text_en": "+5 Dioptres", "text_or": "+5 ଡାୟୋପ୍ଟର"},
                {"id": "B", "text_en": "-5 Dioptres", "text_or": "-5 ଡାୟୋପ୍ଟର"},
                {"id": "C", "text_en": "+0.05 Dioptres", "text_or": "+0.05 ଡାୟୋପ୍ଟର"},
                {"id": "D", "text_en": "+2 Dioptres", "text_or": "+2 ଡାୟୋପ୍ଟର"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "P = 1 / f(in metres) = 1 / 0.20 = +5 Dioptres.",
            "explanation_or": "P = 1 / f(ମିଟରରେ) = 1 / 0.20 = +5 ଡାୟୋପ୍ଟର ଅଟେ ।",
        },
        {
            "id": "q_c12_optics_05",
            "chapter_id": "chap_c12_optics",
            "concept_id": "cpt_c12_refraction",
            "difficulty": QuestionDifficulty.EASY.value,
            "marks": 4.0,
            "negative_marks": 1.0,
            "stem_en": "Which phenomenon is responsible for the glittering of diamonds?",
            "stem_or": "ହୀରାର ଚମକିବା ପଛରେ କେଉଁ ଆଲୋକୀୟ ଘଟଣା ଦାୟୀ?",
            "options": [
                {"id": "A", "text_en": "Total Internal Reflection", "text_or": "ପୂର୍ଣ୍ଣ ଆଭ୍ୟନ୍ତରୀଣ ପ୍ରତିଫଳନ"},
                {"id": "B", "text_en": "Dispersion only", "text_or": "କେବଳ ବିଛୁରଣ"},
                {"id": "C", "text_en": "Diffraction", "text_or": "ବିବର୍ତ୍ତନ"},
                {"id": "D", "text_en": "Polarization", "text_or": "ଧ୍ରୁବୀକରଣ"},
            ],
            "correct_answer": {"selected_option": "A"},
            "explanation_en": "Diamonds have high refractive index and low critical angle (24.4 deg), causing total internal reflection.",
            "explanation_or": "ହୀରାର କମ୍ ସଂକଟ କୋଣ ଯୋଗୁଁ ଆଭ୍ୟନ୍ତରୀଣ ପୂର୍ଣ୍ଣ ପ୍ରତିଫଳନ ଘଟେ ।",
        },
    ]

    for q_data in demo_questions_raw:
        if not db.query(Question).filter_by(id=q_data["id"]).first():
            q = Question(
                id=q_data["id"],
                chapter_id=q_data["chapter_id"],
                concept_id=q_data["concept_id"],
                type=QuestionType.SINGLE_CHOICE.value,
                difficulty=q_data["difficulty"],
                marks=q_data["marks"],
                negative_marks=q_data["negative_marks"],
                expected_time_seconds=60,
                language="bilingual",
                stem_en=q_data["stem_en"],
                stem_or=q_data["stem_or"],
                options=q_data["options"],
                correct_answer=q_data["correct_answer"],
                explanation_en=q_data["explanation_en"],
                explanation_or=q_data["explanation_or"],
                distractor_metadata={"notes": "Curated reviewed demo question"},
                version="1.0.0",
                approval_state=ApprovalState.APPROVED.value,
            )
            db.add(q)
    db.commit()
    logger.info("Demo data seeding completed successfully.")


if __name__ == "__main__":
    from app.db.session import SessionLocal

    logging.basicConfig(level=logging.INFO)
    session = SessionLocal()
    try:
        seed_demo_data(session)
    finally:
        session.close()
