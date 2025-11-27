export const DUMMY_QUESTIONS = {
  scales: {
    TRL: {
      name: {
        en: "Technology Readiness Level",
        fr: "Niveau de Maturité Technologique",
      },
      abbreviation: "TRL",
      questions: [
        {
          id: "TRL_Q1",
          levels: {
            "1": {
              en: "The concept is only described informally.",
              fr: "Le concept n'est décrit que de manière informelle.",
            },
            "2": {
              en: "A brief formalization is available, accompanied by an illustration or diagram.",
              fr: "Une formalisation succincte est disponible, accompagnée d'une illustration ou d'un schéma.",
            },
            "3": {
              en: "The solution is described as a whole, with its key components, along with their functions.",
              fr: "La solution est décrite dans son ensemble, avec ses composants clés et leurs fonctions.",
            },
            "4": {
              en: "All key components are selected and described, along with their functions.",
              fr: "Tous les composants clés sont sélectionnés et décrits, avec leurs fonctions.",
            },
            "5": {
              en: "The entire product is described, with the components and their interfaces.",
              fr: "L'ensemble du produit est décrit, avec les composants et leurs interfaces.",
            },
            "6": {
              en: "CAD models and technical drawings are produced for the selected components.",
              fr: "Des modèles CAO et des plans techniques sont produits pour les composants sélectionnés.",
            },
            "7": {
              en: "All major components have been built and observed.",
              fr: "Tous les composants principaux ont été construits et observés.",
            },
            "8": {
              en: "A scaled-down prototype is built, observed, and tested, to validate the design prototypes/tools were used to adjust the design.",
              fr: "Un prototype à échelle réduite est construit, observé et testé pour valider la conception; des prototypes/outils ont été utilisés pour ajuster la conception.",
            },
            "9": {
              en: "The complete system (product and process) is demonstrated in the operational environment.",
              fr: "Le système complet (produit et processus) est démontré dans l'environnement opérationnel.",
            },
          },
          question: {
            en: "Is the technical concept formulated and positioned in relation to the existing system?",
            fr: "Le concept technique est-il formulé et positionné par rapport au système existant?",
          },
        },
        {
          id: "TRL_Q2",
          levels: {
            "1": {
              en: "No representation exists.",
              fr: "Aucune représentation n'existe.",
            },
            "2": {
              en: "A preliminary sketch or diagram is available.",
              fr: "Une esquisse préliminaire ou un schéma est disponible.",
            },
            "3": {
              en: "3D views or simplified digital models were produced.",
              fr: "Des vues 3D ou des modèles numériques simplifiés ont été produits.",
            },
            "4": {
              en: "CAD models and technical drawings are produced for the selected components.",
              fr: "Des modèles CAO et des plans techniques sont produits pour les composants sélectionnés.",
            },
            "5": {
              en: "The CAD/BIM model is used in a pilot project.",
              fr: "Le modèle CAO/BIM est utilisé dans un projet pilote.",
            },
            "6": {
              en: "The CAD/BIM model is finalized for commercial and industrial use (pre-production stage).",
              fr: "Le modèle CAO/BIM est finalisé pour une utilisation commerciale et industrielle (stade de pré-production).",
            },
            "7": {
              en: "Implementation and instrumented monitoring of the process in a real environment.",
              fr: "Mise en œuvre et surveillance instrumentée du processus dans un environnement réel.",
            },
            "8": {
              en: "Several experimental applications on real pilot projects after implementation.",
              fr: "Plusieurs applications expérimentales sur des projets pilotes réels après la mise en œuvre.",
            },
            "9": {
              en: "The solution is mass-produced and monitored after implementation.",
              fr: "La solution est produite en série et surveillée après la mise en œuvre.",
            },
          },
          question: {
            en: "Have you developed a graphic or digital representation of the product (plans, model, CAD prototyping)?",
            fr: "Avez-vous développé une représentation graphique ou numérique du produit (plans, maquette, prototypage CAO)?",
          },
        },
        {
          id: "TRL_Q3",
          levels: {
            "1": {
              en: "No prototype or model was made.",
              fr: "Aucun prototype ou modèle n'a été réalisé.",
            },
            "2": {
              en: "Elements, materials and components are collected to validate feasibility.",
              fr: "Des éléments, matériaux et composants sont collectés pour valider la faisabilité.",
            },
            "3": {
              en: "A mockup or partial MVP is available.",
              fr: "Une maquette ou un MVP partiel est disponible.",
            },
            "4": {
              en: "All major components have been built and observed.",
              fr: "Tous les composants principaux ont été construits et observés.",
            },
            "5": {
              en: "A scaled-down prototype is built, observed, and tested, to validate the design prototypes/tools were used to adjust the design.",
              fr: "Un prototype à échelle réduite est construit, observé et testé pour valider la conception; des prototypes/outils ont été utilisés pour ajuster la conception.",
            },
            "6": {
              en: "Tests carried out on a representative scale for future market conditions, including key interface between components.",
              fr: "Tests réalisés à une échelle représentative des conditions de marché futures, y compris l'interface clé entre les composants.",
            },
            "7": {
              en: "The technical feasibility of the solution is demonstrated and the feasibility of the solution's concept (proof of feasibility).",
              fr: "La faisabilité technique de la solution est démontrée ainsi que la faisabilité du concept de la solution (preuve de faisabilité).",
            },
            "8": {
              en: "Models or partial elements are made for proof-of-concept testing in a lab-scale setting.",
              fr: "Des modèles ou éléments partiels sont réalisés pour des tests de preuve de concept à l'échelle du laboratoire.",
            },
            "9": {
              en: "The solution is validated with data from production, value calculations, life cycle analyses and market feedback.",
              fr: "La solution est validée avec des données de production, des calculs de valeur, des analyses de cycle de vie et des retours du marché.",
            },
          },
          question: {
            en: "Have you developed mockups, prototypes or implemented the product on real site?",
            fr: "Avez-vous développé des maquettes, des prototypes ou mis en œuvre le produit sur un site réel?",
          },
        },
        {
          id: "TRL_Q4",
          levels: {
            "1": {
              en: "No testing has yet been carried out.",
              fr: "Aucun test n'a encore été effectué.",
            },
            "2": {
              en: "No tests have been carried out but the state of the art and preliminary observations confirming the initial hypothesis.",
              fr: "Aucun test n'a été effectué mais l'état de l'art et les observations préliminaires confirment l'hypothèse initiale.",
            },
            "3": {
              en: "The technical feasibility of the solution is demonstrated and the feasibility of the solution's concept (proof of feasibility).",
              fr: "La faisabilité technique de la solution est démontrée ainsi que la faisabilité du concept (preuve de faisabilité).",
            },
            "4": {
              en: "Initial experimental tests carried out in the laboratory on components and concept.",
              fr: "Premiers tests expérimentaux réalisés en laboratoire sur les composants et le concept.",
            },
            "5": {
              en: "Tests carried out in a representative scale for future market conditions, including key interface between components.",
              fr: "Tests réalisés à une échelle représentative des conditions de marché futures, y compris l'interface clé entre les composants.",
            },
            "6": {
              en: "Tests carried out on small prototypes including key interface between components.",
              fr: "Tests réalisés sur de petits prototypes incluant l'interface clé entre les composants.",
            },
            "7": {
              en: "The complete system (product and process) is demonstrated in the operational environment, similar to its scalability for use.",
              fr: "Le système complet (produit et processus) est démontré dans l'environnement opérationnel, similaire à son évolutivité pour l'utilisation.",
            },
            "8": {
              en: "The test results are comparative and have enabled an iterative evolution of the process and product for the pilot site.",
              fr: "Les résultats des tests sont comparatifs et ont permis une évolution itérative du processus et du produit pour le site pilote.",
            },
            "9": {
              en: "Continuous monitoring in place to identify opportunities for improvement, users, owners are satisfied and included in the stakeholders implementation, users, and learning are standardized and integrated in organizations.",
              fr: "Une surveillance continue est en place pour identifier les opportunités d'amélioration, les utilisateurs et propriétaires sont satisfaits et inclus dans la mise en œuvre des parties prenantes, les utilisateurs et l'apprentissage sont standardisés et intégrés dans les organisations.",
            },
          },
          question: {
            en: "Have you carried out laboratory, representative or real site environment tests?",
            fr: "Avez-vous effectué des tests en laboratoire, représentatifs ou sur des environnements de sites réels?",
          },
        },
        {
          id: "TRL_Q5",
          levels: {
            "1": {
              en: "No regulatory or voluntary testing carried out.",
              fr: "Aucun test réglementaire ou volontaire effectué.",
            },
            "2": {
              en: "An initial analysis of regulatory requirements is carried out.",
              fr: "Une analyse initiale des exigences réglementaires est effectuée.",
            },
            "3": {
              en: "A targeted set of testing on existing solutions is performed with hypothesis and constraints.",
              fr: "Un ensemble ciblé de tests sur les solutions existantes est réalisé avec des hypothèses et des contraintes.",
            },
            "4": {
              en: "The laboratory tests carried out on mock-ups show.",
              fr: "Les tests en laboratoire effectués sur des maquettes le montrent.",
            },
            "5": {
              en: "A simplified CA or LCA screening is performed.",
              fr: "Un screening ACV ou ACV simplifié est effectué.",
            },
            "6": {
              en: "Full LCA is applied to real case (initial site).",
              fr: "L'ACV complète est appliquée à un cas réel (site initial).",
            },
            "7": {
              en: "UCA's applied to real case (initial site).",
              fr: "Les ACV sont appliquées au cas réel (site initial).",
            },
            "8": {
              en: "A test version of ISO14025 is available.",
              fr: "Une version test d'ISO14025 est disponible.",
            },
            "9": {
              en: "A final version of ISO14025 is available. Monitoring and performance guarantee.",
              fr: "Une version finale d'ISO14025 est disponible. Surveillance et garantie de performance.",
            },
          },
          question: {
            en: "Have laboratory or voluntary tests been carried out?",
            fr: "Des tests en laboratoire ou volontaires ont-ils été effectués?",
          },
        },
        {
          id: "TRL_Q6",
          levels: {
            "1": {
              en: "No plan or follow-up.",
              fr: "Aucun plan ou suivi.",
            },
            "2": {
              en: "Experimented roles are identified.",
              fr: "Les rôles expérimentés sont identifiés.",
            },
            "3": {
              en: "A project team is identified.",
              fr: "Une équipe projet est identifiée.",
            },
            "4": {
              en: "A budget is elaborated to development and demonstration phases.",
              fr: "Un budget est élaboré pour les phases de développement et de démonstration.",
            },
            "5": {
              en: "Validation of KPIs in demonstration or test bench scenario to initial pilot site.",
              fr: "Validation des KPI dans un scénario de démonstration ou de banc d'essai vers le site pilote initial.",
            },
            "6": {
              en: "A first pilot site has been identified on which the owners, partners, are informed and included in the stakeholders implementation, users, and learning are standardized and integrated in organizations.",
              fr: "Un premier site pilote a été identifié sur lequel les propriétaires, partenaires sont informés et inclus dans la mise en œuvre des parties prenantes, les utilisateurs et l'apprentissage sont standardisés et intégrés dans les organisations.",
            },
            "7": {
              en: "The first test and customer feedback on the first demonstration site with test agreements.",
              fr: "Le premier test et les retours clients sur le premier site de démonstration avec des accords de test.",
            },
            "8": {
              en: "Actual user feedback (compliance) with interest and perceived relevance.",
              fr: "Retours utilisateurs réels (conformité) avec intérêt et pertinence perçue.",
            },
            "9": {
              en: "Several projects demonstrate market fit and scalability.",
              fr: "Plusieurs projets démontrent l'adéquation au marché et la scalabilité.",
            },
          },
          question: {
            en: "Have you structured your product development (planning, resources, roles)?",
            fr: "Avez-vous structuré votre développement de produit (planification, ressources, rôles)?",
          },
        },
        {
          id: "TRL_Q7",
          levels: {
            "1": {
              en: "Areas of need have been identified, but without validation.",
              fr: "Des domaines de besoin ont été identifiés, mais sans validation.",
            },
            "2": {
              en: "An initial analysis of the demand was carried out.",
              fr: "Une analyse initiale de la demande a été effectuée.",
            },
            "3": {
              en: "Market study and insight are clarified with actual data (real problems, value).",
              fr: "L'étude de marché et les perspectives sont clarifiées avec des données réelles (problèmes réels, valeur).",
            },
            "4": {
              en: "Structured value proposition, validated by MVP use functions model.",
              fr: "Proposition de valeur structurée, validée par le modèle de fonctions d'utilisation MVP.",
            },
            "5": {
              en: "The need is validated by user feedback on the first tests, prototypes, etc.",
              fr: "Le besoin est validé par les retours utilisateurs sur les premiers tests, prototypes, etc.",
            },
            "6": {
              en: "Small-scale prototypes were used to select a reliable method (proof-of-concept) validated.",
              fr: "Des prototypes à petite échelle ont été utilisés pour sélectionner une méthode fiable (preuve de concept) validée.",
            },
            "7": {
              en: "A first pilot site has been identified on which the service providers, partners are informed and included in the stakeholders.",
              fr: "Un premier site pilote a été identifié sur lequel les prestataires de services, partenaires sont informés et inclus dans les parties prenantes.",
            },
            "8": {
              en: "Cost validated on prototypes or small series.",
              fr: "Coût validé sur prototypes ou petites séries.",
            },
            "9": {
              en: "Continuous monitoring in place to identify opportunities and improvement, a strategic plan is consolidated by demonstration and validated by tests, quality norms and industrial performance guarantee.",
              fr: "Une surveillance continue est en place pour identifier les opportunités et améliorations, un plan stratégique est consolidé par la démonstration et validé par des tests, des normes de qualité et une garantie de performance industrielle.",
            },
          },
          question: {
            en: "Does your solution meet a more closely identified and well defined & validated demand?",
            fr: "Votre solution répond-elle à une demande plus précisément identifiée, bien définie et validée?",
          },
        },
      ],
    },
    MkRL: {
      name: {
        en: "Market Readiness Level",
        fr: "Niveau de Maturité de Marché",
      },
      abbreviation: "MkRL",
      questions: [
        {
          id: "MkRL_Q1",
          levels: {
            "1": {
              en: "Only exploratory research was conducted on seeking manufacturing or existing.",
              fr: "Seule une recherche exploratoire a été menée sur la recherche de fabrication ou d'existant.",
            },
            "2": {
              en: "The first manufacturing scenario (equipment, organization) was implemented.",
              fr: "Le premier scénario de fabrication (équipement, organisation) a été mis en œuvre.",
            },
            "3": {
              en: "A factory concept is drawn up, and the feasibility of key components has been calculated (manufacturing value chain scenario).",
              fr: "Un concept d'usine est élaboré et la faisabilité des composants clés a été calculée (scénario de chaîne de valeur de fabrication).",
            },
            "4": {
              en: "A full-scale prototype of the complete system (production organization) is built and demonstrated.",
              fr: "Un prototype à échelle réelle du système complet (organisation de production) est construit et démontré.",
            },
            "5": {
              en: "Small-scale prototypes were used to select a reliable method (proof-of-concept) validated.",
              fr: "Des prototypes à petite échelle ont été utilisés pour sélectionner une méthode fiable (preuve de concept) validée.",
            },
            "6": {
              en: "Complete small-scale prototypes are tested in a realistic environment.",
              fr: "Des prototypes complets à petite échelle sont testés dans un environnement réaliste.",
            },
            "7": {
              en: "Full-scale prototypes are implemented on a test environment.",
              fr: "Des prototypes à échelle réelle sont mis en œuvre dans un environnement de test.",
            },
            "8": {
              en: "A full-scale prototype is operational; the manufacturing has a qualified for external, the industrialized and commercial pilot (SME).",
              fr: "Un prototype à échelle réelle est opérationnel; la fabrication a une qualification pour l'externe, le pilote industrialisé et commercial (PME).",
            },
            "9": {
              en: "Social production in place, i.e., currently used by the marketplace (commercial and industrial) purposes.",
              fr: "Production sociale en place, c'est-à-dire actuellement utilisée à des fins de marché (commercial et industriel).",
            },
          },
          question: {
            en: "Have you identified the market segment, target customers and defined and structured the value proposition for early-stage users?",
            fr: "Avez-vous identifié le segment de marché, les clients cibles et défini et structuré la proposition de valeur pour les utilisateurs précoces?",
          },
        },
        {
          id: "MkRL_Q2",
          levels: {
            "1": {
              en: "Industrial capabilities are analyzed with regard to the concept.",
              fr: "Les capacités industrielles sont analysées par rapport au concept.",
            },
            "2": {
              en: "An initial material organization has been assembled.",
              fr: "Une organisation matérielle initiale a été assemblée.",
            },
            "3": {
              en: "Models or partial elements are made for proof-of-concept testing in a lab-scale setting.",
              fr: "Des modèles ou éléments partiels sont réalisés pour des tests de preuve de concept à l'échelle du laboratoire.",
            },
            "4": {
              en: "The supply chain is documented up to manufacturing.",
              fr: "La chaîne d'approvisionnement est documentée jusqu'à la fabrication.",
            },
            "5": {
              en: "Partners are identified, flows are modeled and communicated.",
              fr: "Les partenaires sont identifiés, les flux sont modélisés et communiqués.",
            },
            "6": {
              en: "Tools and training for craftsmen, design offices, partners are developed and tested with all stakeholders for dissemination at a pilot site.",
              fr: "Des outils et des formations pour les artisans, bureaux d'études, partenaires sont développés et testés avec toutes les parties prenantes pour diffusion sur un site pilote.",
            },
            "7": {
              en: "Consolidation of costs for the business plan and verification of the model.",
              fr: "Consolidation des coûts pour le plan d'affaires et vérification du modèle.",
            },
            "8": {
              en: "Cost confirmed on a first pilot site.",
              fr: "Coût confirmé sur un premier site pilote.",
            },
            "9": {
              en: "The business model is constantly validated on the demonstration and validated by market references both operational business and operations.",
              fr: "Le modèle économique est constamment validé sur la démonstration et validé par des références de marché tant opérationnelles que commerciales.",
            },
          },
          question: {
            en: "Have you carried out user studies, representative surveys or feedback collection on early-stage users?",
            fr: "Avez-vous effectué des études utilisateurs, des enquêtes représentatives ou une collecte de retours sur les utilisateurs précoces?",
          },
        },
        {
          id: "MkRL_Q3",
          levels: {
            "1": {
              en: "Only exploratory research was conducted on production in manufacturing or existing.",
              fr: "Seule une recherche exploratoire a été menée sur la production en fabrication ou existante.",
            },
            "2": {
              en: "Production constraints are beginning to be in place.",
              fr: "Les contraintes de production commencent à être en place.",
            },
            "3": {
              en: "Technical specifications and industrial processes are defined.",
              fr: "Les spécifications techniques et les processus industriels sont définis.",
            },
            "4": {
              en: "Quality control criteria are drawn up by the manufacturing organizations.",
              fr: "Les critères de contrôle qualité sont établis par les organisations de fabrication.",
            },
            "5": {
              en: "Production documentation is available and validated by the manufacturing organizations.",
              fr: "La documentation de production est disponible et validée par les organisations de fabrication.",
            },
            "6": {
              en: "Industrial resources are installed and validated successful real case.",
              fr: "Les ressources industrielles sont installées et validées avec succès dans un cas réel.",
            },
            "7": {
              en: "A full-scale manufacturing is operational; the manufacturing organizations have trained about quality. Logistics are efficient, with traceability, labeling, all guarantee information, warranty. The control chain and tools are maintained, operators are trained, and tools are optimized and scalable, operators are properly trained, and quality control is continuously integrated and managed.",
              fr: "Une fabrication à grande échelle est opérationnelle; les organisations de fabrication ont été formées à la qualité. La logistique est efficace, avec traçabilité, étiquetage, toutes les informations de garantie. La chaîne de contrôle et les outils sont maintenus, les opérateurs sont formés, et les outils sont optimisés et évolutifs, les opérateurs sont correctement formés, et le contrôle qualité est continuellement intégré et géré.",
            },
            "8": {
              en: "Tools are maintained, operators are properly trained, and quality control is continuously integrated and managed.",
              fr: "Les outils sont maintenus, les opérateurs sont correctement formés, et le contrôle qualité est continuellement intégré et géré.",
            },
            "9": {
              en: "Warranty activated on commercial and industrial projects (market). Quality control operators and technical knowledge of the product.",
              fr: "Garantie activée sur les projets commerciaux et industriels (marché). Opérateurs de contrôle qualité et connaissance technique du produit.",
            },
          },
          question: {
            en: "Are you in the understanding and control of your manufacturing process (production, quality, quality and training)?",
            fr: "Êtes-vous dans la compréhension et le contrôle de votre processus de fabrication (production, qualité et formation)?",
          },
        },
        {
          id: "MkRL_Q4",
          levels: {
            "1": {
              en: "No prototypes was made.",
              fr: "Aucun prototype n'a été réalisé.",
            },
            "2": {
              en: "Production process and materials are identified.",
              fr: "Le processus de production et les matériaux sont identifiés.",
            },
            "3": {
              en: "Models or partial elements are made for proof-of-concept testing in a lab-scale setting.",
              fr: "Des modèles ou éléments partiels sont réalisés pour des tests de preuve de concept à l'échelle du laboratoire.",
            },
            "4": {
              en: "Working prototypes of components are ready for demonstration (proof-of-concept).",
              fr: "Des prototypes fonctionnels de composants sont prêts pour la démonstration (preuve de concept).",
            },
            "5": {
              en: "The logistics plan is integrated (transport, storage), but partners have not yet been identified or confirmed.",
              fr: "Le plan logistique est intégré (transport, stockage), mais les partenaires n'ont pas encore été identifiés ou confirmés.",
            },
            "6": {
              en: "Sites and building organizations, are ready to integrate a first pilot site. Complete system is manufactured and implemented, but the test environment differs from the actual lab or a real environment, and test has not yet been carried out.",
              fr: "Les sites et organisations de construction sont prêts à intégrer un premier site pilote. Le système complet est fabriqué et mis en œuvre, mais l'environnement de test diffère du laboratoire réel ou d'un environnement réel, et le test n'a pas encore été effectué.",
            },
            "7": {
              en: "A first version of ISO14025 is published; validated by the first pilot sites (or data bases).",
              fr: "Une première version d'ISO14025 est publiée; validée par les premiers sites pilotes (ou bases de données).",
            },
            "8": {
              en: "Indicators are being tracked for a first pilot site.",
              fr: "Les indicateurs sont suivis pour un premier site pilote.",
            },
            "9": {
              en: "Production at stabilized scale (launch); the actual results (final site) are available for follow up, guarantee for the marketplace.",
              fr: "Production à l'échelle stabilisée (lancement); les résultats réels (site final) sont disponibles pour le suivi, garantie pour le marché.",
            },
          },
          question: {
            en: "What is the progress of prototyping and field validations?",
            fr: "Quel est l'état d'avancement du prototypage et des validations sur le terrain?",
          },
        },
      ],
    },
    MfRL: {
      name: {
        en: "Manufacturing Readiness Level",
        fr: "Niveau de Maturité de Fabrication",
      },
      abbreviation: "MfRL",
      questions: [
        {
          id: "MfRL_Q1",
          levels: {
            "1": {
              en: "No plan or estimates.",
              fr: "Aucun plan ou estimation.",
            },
            "2": {
              en: "Estimated cost from economic data or past.",
              fr: "Coût estimé à partir de données économiques ou passées.",
            },
            "3": {
              en: "Detailed cost based on reasoned hypotheses and success of initial hypothesis or project.",
              fr: "Coût détaillé basé sur des hypothèses raisonnées et le succès de l'hypothèse initiale ou du projet.",
            },
            "4": {
              en: "A budget is elaborated for development and demonstration phases.",
              fr: "Un budget est élaboré pour les phases de développement et de démonstration.",
            },
            "5": {
              en: "An MVP supports the value proposition and tests data and justification for early-adoption hypothesis.",
              fr: "Un MVP soutient la proposition de valeur et teste les données et la justification pour l'hypothèse d'adoption précoce.",
            },
            "6": {
              en: "Integration of building variants and suggestion (co-design with clients).",
              fr: "Intégration de variantes de construction et suggestion (co-conception avec les clients).",
            },
            "7": {
              en: "Consideration of costs for the business plan and identification of partners and justification in the overall project implementation.",
              fr: "Prise en compte des coûts pour le plan d'affaires et identification des partenaires et justification dans la mise en œuvre globale du projet.",
            },
            "8": {
              en: "Cost confirmed on a first pilot site.",
              fr: "Coût confirmé sur un premier site pilote.",
            },
            "9": {
              en: "The business model is consolidated (mission proven) & sustained operations.",
              fr: "Le modèle économique est consolidé (mission prouvée) et opérations soutenues.",
            },
          },
          question: {
            en: "Have you assumed the costs (production, lifecycle) and defined a market target and a positioning pricing strategy?",
            fr: "Avez-vous assumé les coûts (production, cycle de vie) et défini une cible de marché et une stratégie de positionnement tarifaire?",
          },
        },
        {
          id: "MfRL_Q2",
          levels: {
            "1": {
              en: "No structured thinking about the supply chain.",
              fr: "Aucune réflexion structurée sur la chaîne d'approvisionnement.",
            },
            "2": {
              en: "An initial material organization has been assembled.",
              fr: "Une organisation matérielle initiale a été assemblée.",
            },
            "3": {
              en: "Organizational structures and process flows are documented, but not yet compared with reference models.",
              fr: "Les structures organisationnelles et les flux de processus sont documentés, mais pas encore comparés aux modèles de référence.",
            },
            "4": {
              en: "The logistics plan is integrated (transport, storage), but partners have not yet been identified or confirmed.",
              fr: "Le plan logistique est intégré (transport, stockage), mais les partenaires n'ont pas encore été identifiés ou confirmés.",
            },
            "5": {
              en: "Experimented teams or partners, flows modeled and communicated.",
              fr: "Équipes ou partenaires expérimentés, flux modélisés et communiqués.",
            },
            "6": {
              en: "Sites stakeholders (implementation, users, are informed and included in the stakeholders).",
              fr: "Les parties prenantes des sites (mise en œuvre, utilisateurs) sont informées et incluses dans les parties prenantes.",
            },
            "7": {
              en: "Tools and training for craftsmen, design offices, partners are standardized (integrated) with all stakeholders for the first site with agreement.",
              fr: "Les outils et formations pour les artisans, bureaux d'études, partenaires sont standardisés (intégrés) avec toutes les parties prenantes pour le premier site avec accord.",
            },
            "8": {
              en: "Pre-commercial demonstration reinforces market interest and perceived relevance.",
              fr: "La démonstration pré-commerciale renforce l'intérêt du marché et la pertinence perçue.",
            },
            "9": {
              en: "Several projects demonstrate market fit and scalability.",
              fr: "Plusieurs projets démontrent l'adéquation au marché et la scalabilité.",
            },
          },
          question: {
            en: "Have you structured your supply chain (procurement, transport, storage, marketing)?",
            fr: "Avez-vous structuré votre chaîne d'approvisionnement (approvisionnement, transport, stockage, commercialisation)?",
          },
        },
        {
          id: "MfRL_Q3",
          levels: {
            "1": {
              en: "No formalization of the economic model or plans.",
              fr: "Aucune formalisation du modèle économique ou des plans.",
            },
            "2": {
              en: "A business plan is currently being drawn up with assumptions about demand, business canvas, etc.",
              fr: "Un plan d'affaires est actuellement en cours d'élaboration avec des hypothèses sur la demande, le canevas commercial, etc.",
            },
            "3": {
              en: "The proposal of concept indicates strong potential to achieve strategic objectives (costs, usage, main points of vigilance) for future developments.",
              fr: "La proposition de concept indique un fort potentiel pour atteindre les objectifs stratégiques (coûts, utilisation, principaux points de vigilance) pour les développements futurs.",
            },
            "4": {
              en: "Market study and insight are clarified with actual data (real problems, value) side use with real data (problems, value).",
              fr: "L'étude de marché et les perspectives sont clarifiées avec des données réelles (problèmes réels, valeur) utilisation avec des données réelles (problèmes, valeur).",
            },
            "5": {
              en: "The purpose of business plan, including value proposition, is clarified with client side use with real data (problems, value).",
              fr: "L'objectif du plan d'affaires, y compris la proposition de valeur, est clarifié avec l'utilisation côté client avec des données réelles (problèmes, valeur).",
            },
            "6": {
              en: "An MVP supports the value proposition and tests data and justification for early-adoption hypothesis with client side use with real data (problems, value).",
              fr: "Un MVP soutient la proposition de valeur et teste les données et la justification pour l'hypothèse d'adoption précoce avec l'utilisation côté client avec des données réelles (problèmes, valeur).",
            },
            "7": {
              en: "Integration of building variants and suggestion (co-design with clients).",
              fr: "Intégration de variantes de construction et suggestion (co-conception avec les clients).",
            },
            "8": {
              en: "Data and justification for early-adoption hypothesis with perceived relevance validated and tested with early targets, and hypothesis of volumes.",
              fr: "Données et justification pour l'hypothèse d'adoption précoce avec pertinence perçue validée et testée avec les cibles précoces, et hypothèse de volumes.",
            },
            "9": {
              en: "A comprehensive system is manufactured and implemented at large scale (market production) & industrial manufacturing process.",
              fr: "Un système complet est fabriqué et mis en œuvre à grande échelle (production de marché) et processus de fabrication industrielle.",
            },
          },
          question: {
            en: "Have you formalized the economic model and marketing plan?",
            fr: "Avez-vous formalisé le modèle économique et le plan marketing?",
          },
        },
        {
          id: "MfRL_Q4",
          levels: {
            "1": {
              en: "No quality system or control in place.",
              fr: "Aucun système qualité ou contrôle en place.",
            },
            "2": {
              en: "An initial material organization has been assembled.",
              fr: "Une organisation matérielle initiale a été assemblée.",
            },
            "3": {
              en: "Production constraints are beginning to be in place.",
              fr: "Les contraintes de production commencent à être en place.",
            },
            "4": {
              en: "Technical specifications and industrial processes are defined.",
              fr: "Les spécifications techniques et les processus industriels sont définis.",
            },
            "5": {
              en: "Quality control criteria are drawn up by the production documentation is available and validated by the test.",
              fr: "Les critères de contrôle qualité sont établis par la documentation de production qui est disponible et validée par le test.",
            },
            "6": {
              en: "Production documentation is available and validated by the manufacturing organization.",
              fr: "La documentation de production est disponible et validée par l'organisation de fabrication.",
            },
            "7": {
              en: "Industrial resources are installed and validated successful real case.",
              fr: "Les ressources industrielles sont installées et validées avec succès dans un cas réel.",
            },
            "8": {
              en: "Quality, manufacturing and implementation monitor of the full project as a real site. Logistics are efficient with traceability labeling, all guarantee information, warranty. Tools are maintained, operators are properly trained, and quality control is continuously integrated and managed. Production is operational, but the monitoring and updating of measurement and performance monitoring skilled operators and the.",
              fr: "Surveillance de la qualité, de la fabrication et de la mise en œuvre du projet complet comme un site réel. La logistique est efficace avec étiquetage de traçabilité, toutes les informations de garantie. Les outils sont maintenus, les opérateurs sont correctement formés, et le contrôle qualité est continuellement intégré et géré. La production est opérationnelle, mais la surveillance et la mise à jour de la mesure et du suivi des performances des opérateurs qualifiés et le.",
            },
            "9": {
              en: "Quality control is continuously integrated and managed for commercial and industrial purposes. Production systems and protocols for industrial infrastructure and systems are daily consolidated. Warranty and the comprehensive monitoring system and serial quality control.",
              fr: "Le contrôle qualité est continuellement intégré et géré à des fins commerciales et industrielles. Les systèmes de production et protocoles pour l'infrastructure industrielle et les systèmes sont consolidés quotidiennement. Garantie et système de surveillance complet et contrôle qualité en série.",
            },
          },
          question: {
            en: "Are there quality processes and industrial tools in place and functional?",
            fr: "Y a-t-il des processus qualité et des outils industriels en place et fonctionnels?",
          },
        },
      ],
    },
  },
  readinessLevelMapping: {
    "1": {
      phase: 1,
      phaseName: {
        en: "Phase 1: Conceptualization & Research",
        fr: "Phase 1 : Conceptualisation et Recherche",
      },
      focusGoal: {
        en: "Basic Feasibility & Hypothesis Validation",
        fr: "Faisabilité de Base et Validation d'Hypothèse",
      },
      scaleRange: "1-3",
    },
    "2": {
      phase: 1,
      phaseName: {
        en: "Phase 1: Conceptualization & Research",
        fr: "Phase 1 : Conceptualisation et Recherche",
      },
      focusGoal: {
        en: "Basic Feasibility & Hypothesis Validation",
        fr: "Faisabilité de Base et Validation d'Hypothèse",
      },
      scaleRange: "1-3",
    },
    "3": {
      phase: 1,
      phaseName: {
        en: "Phase 1: Conceptualization & Research",
        fr: "Phase 1 : Conceptualisation et Recherche",
      },
      focusGoal: {
        en: "Basic Feasibility & Hypothesis Validation",
        fr: "Faisabilité de Base et Validation d'Hypothèse",
      },
      scaleRange: "1-3",
    },
    "4": {
      phase: 2,
      phaseName: {
        en: "Phase 2: Prototype & Demonstration",
        fr: "Phase 2 : Prototype et Démonstration",
      },
      focusGoal: {
        en: "Critical Function Proof of Concept & Model Validation",
        fr: "Preuve de Concept de Fonction Critique et Validation de Modèle",
      },
      scaleRange: "4-6",
    },
    "5": {
      phase: 2,
      phaseName: {
        en: "Phase 2: Prototype & Demonstration",
        fr: "Phase 2 : Prototype et Démonstration",
      },
      focusGoal: {
        en: "Critical Function Proof of Concept & Model Validation",
        fr: "Preuve de Concept de Fonction Critique et Validation de Modèle",
      },
      scaleRange: "4-6",
    },
    "6": {
      phase: 2,
      phaseName: {
        en: "Phase 2: Prototype & Demonstration",
        fr: "Phase 2 : Prototype et Démonstration",
      },
      focusGoal: {
        en: "Critical Function Proof of Concept & Model Validation",
        fr: "Preuve de Concept de Fonction Critique et Validation de Modèle",
      },
      scaleRange: "4-6",
    },
    "7": {
      phase: 3,
      phaseName: {
        en: "Phase 3: System Demonstration & Validation",
        fr: "Phase 3 : Démonstration et Validation du Système",
      },
      focusGoal: {
        en: "Operational Testing & Pilot Production Viability",
        fr: "Tests Opérationnels et Viabilité de la Production Pilote",
      },
      scaleRange: "7-8",
    },
    "8": {
      phase: 3,
      phaseName: {
        en: "Phase 3: System Demonstration & Validation",
        fr: "Phase 3 : Démonstration et Validation du Système",
      },
      focusGoal: {
        en: "Operational Testing & Pilot Production Viability",
        fr: "Tests Opérationnels et Viabilité de la Production Pilote",
      },
      scaleRange: "7-8",
    },
    "9": {
      phase: 4,
      phaseName: {
        en: "Phase 4: Full Deployment & Scaling",
        fr: "Phase 4 : Déploiement Complet et Mise à l'Échelle",
      },
      focusGoal: {
        en: "Mission Proven & Sustained Operations",
        fr: "Mission Prouvée et Opérations Soutenues",
      },
      scaleRange: "9",
    },
  },
  riskMitigation: {
    TRL_LOWEST: {
      strategicFocus: {
        en: "Maturation & Demonstration",
        fr: "Maturation et Démonstration",
      },
      primaryRisk: {
        en: "Technical Failure / Inoperability",
        fr: "Échec Technique / Inopérabilité",
      },
    },
    MkRL_LOWEST: {
      strategicFocus: {
        en: "Validation, Regulatory & Market",
        fr: "Validation, Réglementaire et Marché",
      },
      primaryRisk: {
        en: "Compliance & Business Viability",
        fr: "Conformité et Viabilité Commerciale",
      },
    },
    MfRL_LOWEST: {
      strategicFocus: {
        en: "Viability & Production & Supply Chain",
        fr: "Viabilité, Production et Chaîne d'Approvisionnement",
      },
      primaryRisk: {
        en: "Production Process / Scalability",
        fr: "Processus de Production / Évolutivité",
      },
    },
  },
  gaps: {
    TRL_Q1: {
      "1": {
        en: "The concept is only described informally.",
        fr: "Le concept n'est décrit que de manière informelle.",
      },
      "2": {
        en: "The solution has not yet been described in its entirety or analyzed in relation to the existing state of the art.",
        fr: "La solution n'a pas encore été décrite dans son intégralité ou analysée par rapport à l'état de l'art existant.",
      },
      "3": {
        en: "The key components and their functions have not yet been identified and described.",
        fr: "Les composants clés et leurs fonctions n'ont pas encore été identifiés et décrits.",
      },
      "4": {
        en: "All key components are selected and described, along with their functions.",
        fr: "Tous les composants clés sont sélectionnés et décrits, avec leurs fonctions.",
      },
      "5": {
        en: "The product and its interfaces integration into the building are not yet fully described or analyzed. The entire product is described, with the components and their interfaces.",
        fr: "Le produit et l'intégration de ses interfaces dans le bâtiment ne sont pas encore entièrement décrits ou analysés. L'ensemble du produit est décrit, avec les composants et leurs interfaces.",
      },
      "6": {
        en: "No feedback on the implementation or process flow yet. Documents are available.",
        fr: "Aucun retour sur la mise en œuvre ou le flux de processus pour l'instant. Les documents sont disponibles.",
      },
      "7": {
        en: "The consolidated technical file is not yet ready for commercial or industrial use.",
        fr: "Le dossier technique consolidé n'est pas encore prêt pour une utilisation commerciale ou industrielle.",
      },
      "8": {
        en: "Overall feedback from the application area is not yet available.",
        fr: "Les retours globaux du domaine d'application ne sont pas encore disponibles.",
      },
      "9": {
        en: "Initial positive feedback on the implementation of the process has been documented.",
        fr: "Des retours positifs initiaux sur la mise en œuvre du processus ont été documentés.",
      },
    },
    TRL_Q2: {
      "1": {
        en: "No representation exists.",
        fr: "Aucune représentation n'existe.",
      },
      "2": {
        en: "3D views or simplified digital models of the solution are not yet available.",
        fr: "Les vues 3D ou modèles numériques simplifiés de la solution ne sont pas encore disponibles.",
      },
      "3": {
        en: "CAD models and technical drawings are produced for the selected components.",
        fr: "Des modèles CAO et des plans techniques sont produits pour les composants sélectionnés.",
      },
      "4": {
        en: "Detailed CAD/BIM models, including interfaces, tolerances and manufacturing instructions, are not yet finalized.",
        fr: "Les modèles CAO/BIM détaillés, incluant les interfaces, tolérances et instructions de fabrication, ne sont pas encore finalisés.",
      },
      "5": {
        en: "The CAD/BIM model is used in a pilot project.",
        fr: "Le modèle CAO/BIM est utilisé dans un projet pilote.",
      },
      "6": {
        en: "The CAD/BIM model is not yet finalized or released for commercial use.",
        fr: "Le modèle CAO/BIM n'est pas encore finalisé ou publié pour une utilisation commerciale.",
      },
      "7": {
        en: "The solution is finalized for commercial and industrial use (pre-production stage).",
        fr: "La solution est finalisée pour une utilisation commerciale et industrielle (stade de pré-production).",
      },
      "8": {
        en: "The product has not yet been evaluated in different usage or context over time.",
        fr: "Le produit n'a pas encore été évalué dans différents usages ou contextes au fil du temps.",
      },
      "9": {
        en: "Implementation and instrumented monitoring of the process is a real environment.",
        fr: "La mise en œuvre et la surveillance instrumentée du processus dans un environnement réel.",
      },
    },
    TRL_Q3: {
      "1": {
        en: "No prototype or model was made.",
        fr: "Aucun prototype ou modèle n'a été réalisé.",
      },
      "2": {
        en: "A mockup or partial MVP is available.",
        fr: "Une maquette ou un MVP partiel est disponible.",
      },
      "3": {
        en: "All major components have been built and observed.",
        fr: "Tous les composants principaux ont été construits et observés.",
      },
      "4": {
        en: "A scaled-down prototype is built, observed, and tested, to validate the design prototypes/tools were used to adjust the design.",
        fr: "Un prototype à échelle réduite est construit, observé et testé pour valider la conception; des prototypes/outils ont été utilisés pour ajuster la conception.",
      },
      "5": {
        en: "The full-scale prototype of the complete system (product and process) has not yet been tested or validated on a small scale. The prototype has not yet been built or tested.",
        fr: "Le prototype à échelle réelle du système complet (produit et processus) n'a pas encore été testé ou validé à petite échelle. Le prototype n'a pas encore été construit ou testé.",
      },
      "6": {
        en: "Product performance has not yet been verified or documented on a pilot site.",
        fr: "Les performances du produit n'ont pas encore été vérifiées ou documentées sur un site pilote.",
      },
      "7": {
        en: "The solution is installed on a pilot site and tested in real use.",
        fr: "La solution est installée sur un site pilote et testée en utilisation réelle.",
      },
      "8": {
        en: "The product has not yet been validated in a different usage or context over time.",
        fr: "Le produit n'a pas encore été validé dans un usage ou contexte différent au fil du temps.",
      },
      "9": {
        en: "Several experimental applications on real pilot projects after implementation.",
        fr: "Plusieurs applications expérimentales sur des projets pilotes réels après la mise en œuvre.",
      },
    },
    TRL_Q4: {
      "1": {
        en: "No testing has yet been carried out.",
        fr: "Aucun test n'a encore été effectué.",
      },
      "2": {
        en: "No tests have been carried out but the state of the art and preliminary observations have validated the initial hypothesis.",
        fr: "Aucun test n'a été effectué mais l'état de l'art et les observations préliminaires ont validé l'hypothèse initiale.",
      },
      "3": {
        en: "All components of the solution are characterized independently analytically or experimentally.",
        fr: "Tous les composants de la solution sont caractérisés indépendamment de manière analytique ou expérimentale.",
      },
      "4": {
        en: "Tests carried out on small prototypes including key interface between components.",
        fr: "Tests réalisés sur de petits prototypes incluant l'interface clé entre les composants.",
      },
      "5": {
        en: "Tests carried out in a representative scale for future market conditions, including key interface between components.",
        fr: "Tests réalisés à une échelle représentative des conditions de marché futures, y compris l'interface clé entre les composants.",
      },
      "6": {
        en: "The product has not yet demonstrated stable performance for continuous or large-scale production.",
        fr: "Le produit n'a pas encore démontré de performances stables pour une production continue ou à grande échelle.",
      },
      "7": {
        en: "Implementation and instrumented monitoring of the process is a real environment.",
        fr: "La mise en œuvre et la surveillance instrumentée du processus dans un environnement réel.",
      },
      "8": {
        en: "Overall performance has not yet been confirmed in actual use or a longer time span.",
        fr: "Les performances globales n'ont pas encore été confirmées dans une utilisation réelle ou sur une période plus longue.",
      },
      "9": {
        en: "The test results are comparative and have enabled an iterative evolution covering the intended area of use and enabling a detailed economic and technical assessment for the intended area of application.",
        fr: "Les résultats des tests sont comparatifs et ont permis une évolution itérative couvrant le domaine d'utilisation prévu et permettant une évaluation économique et technique détaillée pour le domaine d'application prévu.",
      },
    },
    TRL_Q5: {
      "1": {
        en: "No regulatory or voluntary testing carried out.",
        fr: "Aucun test réglementaire ou volontaire effectué.",
      },
      "2": {
        en: "Possible manufacturing processes have not yet been tested or validated on a small scale.",
        fr: "Les processus de fabrication possibles n'ont pas encore été testés ou validés à petite échelle.",
      },
      "3": {
        en: "An initial analysis of regulatory requirements is carried out. An outline of the frameworks of testing solutions is expected.",
        fr: "Une analyse initiale des exigences réglementaires est effectuée. Un aperçu des cadres de solutions de test est attendu.",
      },
      "4": {
        en: "Initial experimental tests carried out in the components are correct.",
        fr: "Les premiers tests expérimentaux effectués dans les composants sont corrects.",
      },
      "5": {
        en: "Initial accredited tests have been carried out on key interface between components. A simplified CA or LCA screening is performed.",
        fr: "Des tests accrédités initiaux ont été effectués sur l'interface clé entre les composants. Un screening ACV ou ACV simplifié est effectué.",
      },
      "6": {
        en: "The product and its process of implementation are tested similar to suitability for use.",
        fr: "Le produit et son processus de mise en œuvre sont testés de manière similaire à l'aptitude à l'utilisation.",
      },
      "7": {
        en: "Initial experimental tests carried out in the components on the first test case. UCA's applied to real case (initial site).",
        fr: "Premiers tests expérimentaux effectués dans les composants sur le premier cas de test. Les ACV sont appliquées au cas réel (site initial).",
      },
      "8": {
        en: "The test results are comparative and have enabled an iterative evolution of the process and product for the pilot site.",
        fr: "Les résultats des tests sont comparatifs et ont permis une évolution itérative du processus et du produit pour le site pilote.",
      },
      "9": {
        en: "A final version of ISO14025 is available. Several pilot projects demonstrate market fit and scalability.",
        fr: "Une version finale d'ISO14025 est disponible. Plusieurs projets pilotes démontrent l'adéquation au marché et la scalabilité.",
      },
    },
    TRL_Q6: {
      "1": {
        en: "No plan or follow-up.",
        fr: "Aucun plan ou suivi.",
      },
      "2": {
        en: "A project team is identified.",
        fr: "Une équipe projet est identifiée.",
      },
      "3": {
        en: "A budget is elaborated to development and demonstration phases.",
        fr: "Un budget est élaboré pour les phases de développement et de démonstration.",
      },
      "4": {
        en: "The additional required expertise has been added or the team composition has been assessed.",
        fr: "L'expertise supplémentaire requise a été ajoutée ou la composition de l'équipe a été évaluée.",
      },
      "5": {
        en: "Validation of KPIs in demonstration or test bench scenario to initial pilot site.",
        fr: "Validation des KPI dans un scénario de démonstration ou de banc d'essai vers le site pilote initial.",
      },
      "6": {
        en: "A first pilot site has been identified on which the owners, partners, are informed and included in the stakeholders implementation, users, and learning are standardized and integrated in organizations.",
        fr: "Un premier site pilote a été identifié sur lequel les propriétaires, partenaires sont informés et inclus dans la mise en œuvre des parties prenantes, les utilisateurs et l'apprentissage sont standardisés et intégrés dans les organisations.",
      },
      "7": {
        en: "Tools and training for craftsmen, design offices, partners are informed and included in the stakeholders.",
        fr: "Les outils et formations pour les artisans, bureaux d'études, partenaires sont informés et inclus dans les parties prenantes.",
      },
      "8": {
        en: "Indicators are being tracked for a first pilot site. Measurement tools and guarantees are ready to be used for a pilot site.",
        fr: "Les indicateurs sont suivis pour un premier site pilote. Les outils de mesure et les garanties sont prêts à être utilisés pour un site pilote.",
      },
      "9": {
        en: "Continuous monitoring in places to identify any opportunities for improvement, a strategic plan is consolidated by demonstration and validated by tests, quality norms and industrial performance guarantee.",
        fr: "Une surveillance continue est en place pour identifier les opportunités d'amélioration, un plan stratégique est consolidé par la démonstration et validé par des tests, des normes de qualité et une garantie de performance industrielle.",
      },
    },
    TRL_Q7: {
      "1": {
        en: "Areas of need have been identified, but without validation.",
        fr: "Des domaines de besoin ont été identifiés, mais sans validation.",
      },
      "2": {
        en: "Market study and insight are clarified with actual data (real problems, value).",
        fr: "L'étude de marché et les perspectives sont clarifiées avec des données réelles (problèmes réels, valeur).",
      },
      "3": {
        en: "Structured value proposition, validated by MVP use functions model.",
        fr: "Proposition de valeur structurée, validée par le modèle de fonctions d'utilisation MVP.",
      },
      "4": {
        en: "The need validated by user feedback on the first tests, prototypes, etc.",
        fr: "Le besoin validé par les retours utilisateurs sur les premiers tests, prototypes, etc.",
      },
      "5": {
        en: "The proposed of concept indicates strong potential to achieve strategic objectives (costs, usage, main points of vigilance) for future developments.",
        fr: "La proposition de concept indique un fort potentiel pour atteindre les objectifs stratégiques (coûts, utilisation, principaux points de vigilance) pour les développements futurs.",
      },
      "6": {
        en: "The voluntary steps required for this measurability (normalized protocols, etc.) have not been compared with existing reference models.",
        fr: "Les étapes volontaires requises pour cette mesurabilité (protocoles normalisés, etc.) n'ont pas été comparées aux modèles de référence existants.",
      },
      "7": {
        en: "An MVP supports the value proposition and tests, data and justification for early adopters are ready.",
        fr: "Un MVP soutient la proposition de valeur et les tests, les données et la justification pour les premiers adopteurs sont prêts.",
      },
      "8": {
        en: "The first test and customer feedback on the first demonstration reinforces market interest and perceived relevance.",
        fr: "Le premier test et les retours clients sur la première démonstration renforcent l'intérêt du marché et la pertinence perçue.",
      },
      "9": {
        en: "Actual user feedback (compliance) with interest and perceived relevance. Several projects demonstrate market fit and scalability.",
        fr: "Retours utilisateurs réels (conformité) avec intérêt et pertinence perçue. Plusieurs projets démontrent l'adéquation au marché et la scalabilité.",
      },
    },
    MkRL_Q1: {
      "1": {
        en: "Only exploratory research was conducted on existing manufacturing practices.",
        fr: "Seule une recherche exploratoire a été menée sur les pratiques de fabrication existantes.",
      },
      "2": {
        en: "The first manufacturing scenario (equipment, organization) was implemented.",
        fr: "Le premier scénario de fabrication (équipement, organisation) a été mis en œuvre.",
      },
      "3": {
        en: "A factory concept is drawn up, and the feasibility of key components has been calculated (manufacturing value chain scenario).",
        fr: "Un concept d'usine est élaboré et la faisabilité des composants clés a été calculée (scénario de chaîne de valeur de fabrication).",
      },
      "4": {
        en: "Small-scale prototypes were used to select a reliable method (proof-of-concept) validated.",
        fr: "Des prototypes à petite échelle ont été utilisés pour sélectionner une méthode fiable (preuve de concept) validée.",
      },
      "5": {
        en: "The production organization and overall production are documented and compared with similar models.",
        fr: "L'organisation de production et la production globale sont documentées et comparées avec des modèles similaires.",
      },
      "6": {
        en: "Small-scale prototypes are produced and implemented in a comparable manufacturing environment.",
        fr: "Des prototypes à petite échelle sont produits et mis en œuvre dans un environnement de fabrication comparable.",
      },
      "7": {
        en: "A full-scale manufacturing is operational; the production line is qualified for external, the industrialized and commercial pilot (SME).",
        fr: "Une fabrication à grande échelle est opérationnelle; la ligne de production est qualifiée pour l'externe, le pilote industrialisé et commercial (PME).",
      },
      "8": {
        en: "The production line is qualified for external, the industrialized and commercial pilot (SME).",
        fr: "La ligne de production est qualifiée pour l'externe, le pilote industrialisé et commercial (PME).",
      },
      "9": {
        en: "Social production in place, in operation as currently used in the industrial and commercial (ISM-PE). Preparation post stabilized not launch. The process and not yet validated and sustained into.",
        fr: "Production sociale en place, en opération tel qu'actuellement utilisé dans l'industriel et commercial (ISM-PE). Préparation post stabilisée non lancée. Le processus et pas encore validé et soutenu.",
      },
    },
    MkRL_Q2: {
      "1": {
        en: "Industrial capabilities are analyzed with regard to the concept.",
        fr: "Les capacités industrielles sont analysées par rapport au concept.",
      },
      "2": {
        en: "An initial material organization has been assembled.",
        fr: "Une organisation matérielle initiale a été assemblée.",
      },
      "3": {
        en: "Models or partial elements are made for proof-of-concept testing in a lab-scale setting.",
        fr: "Des modèles ou éléments partiels sont réalisés pour des tests de preuve de concept à l'échelle du laboratoire.",
      },
      "4": {
        en: "The supply chain is documented up to manufacturing.",
        fr: "La chaîne d'approvisionnement est documentée jusqu'à la fabrication.",
      },
      "5": {
        en: "Partners are identified, flows are modeled and communicated.",
        fr: "Les partenaires sont identifiés, les flux sont modélisés et communiqués.",
      },
      "6": {
        en: "Consideration of costs for the business plan and verification of the model. Cost validated on prototypes or small series.",
        fr: "Prise en compte des coûts pour le plan d'affaires et vérification du modèle. Coût validé sur prototypes ou petites séries.",
      },
      "7": {
        en: "Tools and training for craftsmen, design offices, partners are developed and tested with all stakeholders for dissemination at a pilot site.",
        fr: "Des outils et des formations pour les artisans, bureaux d'études, partenaires sont développés et testés avec toutes les parties prenantes pour diffusion sur un site pilote.",
      },
      "8": {
        en: "Cost confirmed on a first pilot site. Pre-commercial demonstration reinforces market adoption.",
        fr: "Coût confirmé sur un premier site pilote. La démonstration pré-commerciale renforce l'adoption du marché.",
      },
      "9": {
        en: "The business model is consolidated (mission proven) & sustained operations. Cost confirmed on several pilot projects.",
        fr: "Le modèle économique est consolidé (mission prouvée) et opérations soutenues. Coût confirmé sur plusieurs projets pilotes.",
      },
    },
    MkRL_Q3: {
      "1": {
        en: "Only exploratory research was conducted on production in manufacturing or existing.",
        fr: "Seule une recherche exploratoire a été menée sur la production en fabrication ou existante.",
      },
      "2": {
        en: "Production constraints are beginning to be in place.",
        fr: "Les contraintes de production commencent à être en place.",
      },
      "3": {
        en: "Technical specifications and industrial processes are defined.",
        fr: "Les spécifications techniques et les processus industriels sont définis.",
      },
      "4": {
        en: "Quality control criteria are drawn up by the manufacturing organizations.",
        fr: "Les critères de contrôle qualité sont établis par les organisations de fabrication.",
      },
      "5": {
        en: "Production documentation is available and validated by the manufacturing organizations.",
        fr: "La documentation de production est disponible et validée par les organisations de fabrication.",
      },
      "6": {
        en: "Industrial resources are installed and validated successful real case.",
        fr: "Les ressources industrielles sont installées et validées avec succès dans un cas réel.",
      },
      "7": {
        en: "The physical infrastructure and systems are in real-life situations, but the repeatability of operation has not yet been confirmed.",
        fr: "L'infrastructure physique et les systèmes sont dans des situations réelles, mais la répétabilité de l'opération n'a pas encore été confirmée.",
      },
      "8": {
        en: "A full-scale manufacturing is operational; the production line is qualified, manufacturing and implementation monitor of the full project on a real site. Logistics are efficient, with traceability, labeling, all guarantee information, warranty. The control chain.",
        fr: "Une fabrication à grande échelle est opérationnelle; la ligne de production est qualifiée, surveillance de la fabrication et de la mise en œuvre du projet complet sur un site réel. La logistique est efficace, avec traçabilité, étiquetage, toutes les informations de garantie. La chaîne de contrôle.",
      },
      "9": {
        en: "Production is in place, but its monitoring and adjustment of key performance criteria are efficiently and continuously managed after launch. Quality control is continuously integrated and managed for commercial and industrial purposes.",
        fr: "La production est en place, mais sa surveillance et l'ajustement des critères de performance clés sont gérés efficacement et en continu après le lancement. Le contrôle qualité est continuellement intégré et géré à des fins commerciales et industrielles.",
      },
    },
    MkRL_Q4: {
      "1": {
        en: "No prototypes was made.",
        fr: "Aucun prototype n'a été réalisé.",
      },
      "2": {
        en: "Production process and materials are identified.",
        fr: "Le processus de production et les matériaux sont identifiés.",
      },
      "3": {
        en: "Models or partial elements are made for proof-of-concept testing in a lab-scale setting.",
        fr: "Des modèles ou éléments partiels sont réalisés pour des tests de preuve de concept à l'échelle du laboratoire.",
      },
      "4": {
        en: "Working prototypes of components are ready for demonstration (proof-of-concept).",
        fr: "Des prototypes fonctionnels de composants sont prêts pour la démonstration (preuve de concept).",
      },
      "5": {
        en: "The logistics plan is integrated (transport, storage), but partners have not yet been identified or confirmed.",
        fr: "Le plan logistique est intégré (transport, stockage), mais les partenaires n'ont pas encore été identifiés ou confirmés.",
      },
      "6": {
        en: "Sites and building organizations, are ready to integrate a first pilot site. Complete system is manufactured and implemented, but the test environment differs from the actual lab or a real environment, and test has not yet been carried out.",
        fr: "Les sites et organisations de construction sont prêts à intégrer un premier site pilote. Le système complet est fabriqué et mis en œuvre, mais l'environnement de test diffère du laboratoire réel ou d'un environnement réel, et le test n'a pas encore été effectué.",
      },
      "7": {
        en: "The logistics plan integrates transport, storage and partners, and flows are integrated at the pilot site.",
        fr: "Le plan logistique intègre le transport, le stockage et les partenaires, et les flux sont intégrés au site pilote.",
      },
      "8": {
        en: "Indicators are being tracked for a first pilot site.",
        fr: "Les indicateurs sont suivis pour un premier site pilote.",
      },
      "9": {
        en: "Production at stabilized scale (launch); the actual test results (final site) are available for follow up, guarantee for the marketplace.",
        fr: "Production à l'échelle stabilisée (lancement); les résultats de test réels (site final) sont disponibles pour le suivi, garantie pour le marché.",
      },
    },
    MfRL_Q1: {
      "1": {
        en: "No plan or estimates.",
        fr: "Aucun plan ou estimation.",
      },
      "2": {
        en: "Estimated cost from economic data or past.",
        fr: "Coût estimé à partir de données économiques ou passées.",
      },
      "3": {
        en: "Detailed cost based on reasoned hypotheses and success of initial hypothesis or project.",
        fr: "Coût détaillé basé sur des hypothèses raisonnées et le succès de l'hypothèse initiale ou du projet.",
      },
      "4": {
        en: "A budget is elaborated for development and demonstration phases.",
        fr: "Un budget est élaboré pour les phases de développement et de démonstration.",
      },
      "5": {
        en: "An MVP supports the value proposition and tests data and justification for early-adoption hypothesis.",
        fr: "Un MVP soutient la proposition de valeur et teste les données et la justification pour l'hypothèse d'adoption précoce.",
      },
      "6": {
        en: "Integration of building variants and suggestion (co-design with clients).",
        fr: "Intégration de variantes de construction et suggestion (co-conception avec les clients).",
      },
      "7": {
        en: "The cost has been validated by several pilot projects, but post-launch monitoring that has not been ensured or guaranteed for operation has not been optimized.",
        fr: "Le coût a été validé par plusieurs projets pilotes, mais la surveillance post-lancement qui n'a pas été assurée ou garantie pour l'exploitation n'a pas été optimisée.",
      },
      "8": {
        en: "Indicators are involved in several real-world scenarios. The solution is being optimized for a broader commercial deployment and refined performance guarantee. Warranty activated on commercial and industrial projects (market).",
        fr: "Les indicateurs sont impliqués dans plusieurs scénarios réels. La solution est optimisée pour un déploiement commercial plus large et une garantie de performance affinée. Garantie activée sur les projets commerciaux et industriels (marché).",
      },
      "9": {
        en: "The business model is consolidated and validated for scale-up. The price/cost has been validated, but the operating cost has not yet been guaranteed. Continuous monitoring in places to identify any opportunities.",
        fr: "Le modèle économique est consolidé et validé pour la mise à l'échelle. Le prix/coût a été validé, mais le coût opérationnel n'a pas encore été garanti. Surveillance continue en place pour identifier toute opportunité.",
      },
    },
    MfRL_Q2: {
      "1": {
        en: "No structured thinking about the supply chain.",
        fr: "Aucune réflexion structurée sur la chaîne d'approvisionnement.",
      },
      "2": {
        en: "An initial material organization has been assembled.",
        fr: "Une organisation matérielle initiale a été assemblée.",
      },
      "3": {
        en: "Organizational structures and process flows are documented, but not yet compared with reference models.",
        fr: "Les structures organisationnelles et les flux de processus sont documentés, mais pas encore comparés aux modèles de référence.",
      },
      "4": {
        en: "The logistics plan is integrated (transport, storage), but partners have not yet been identified or confirmed.",
        fr: "Le plan logistique est intégré (transport, stockage), mais les partenaires n'ont pas encore été identifiés ou confirmés.",
      },
      "5": {
        en: "Experimented teams or partners, flows modeled and communicated.",
        fr: "Équipes ou partenaires expérimentés, flux modélisés et communiqués.",
      },
      "6": {
        en: "Sites stakeholders (implementation, users, are informed and included in the stakeholders).",
        fr: "Les parties prenantes des sites (mise en œuvre, utilisateurs) sont informées et incluses dans les parties prenantes.",
      },
      "7": {
        en: "The infrastructure and systems are in real-life situations, but the repeatability of operation has not yet been confirmed.",
        fr: "L'infrastructure et les systèmes sont dans des situations réelles, mais la répétabilité de l'opération n'a pas encore été confirmée.",
      },
      "8": {
        en: "Tools and training for craftsmen, design offices, partners are standardized (integrated) with all stakeholders for the first site with agreement. Several commercial applications are available. The production systems are in place, and the logistics processes have been implemented and validated by the first site.",
        fr: "Les outils et formations pour les artisans, bureaux d'études, partenaires sont standardisés (intégrés) avec toutes les parties prenantes pour le premier site avec accord. Plusieurs applications commerciales sont disponibles. Les systèmes de production sont en place, et les processus logistiques ont été mis en œuvre et validés par le premier site.",
      },
      "9": {
        en: "The supply chain is stabilized, but the continuous improvements that needs to be organized in series. Several projects demonstrate market fit and post-operations, logistics are efficient, with traceability, labeling.",
        fr: "La chaîne d'approvisionnement est stabilisée, mais les améliorations continues qui doivent être organisées en série. Plusieurs projets démontrent l'adéquation au marché et les post-opérations, la logistique est efficace, avec traçabilité, étiquetage.",
      },
    },
    MfRL_Q3: {
      "1": {
        en: "No formalization of the economic model or plans.",
        fr: "Aucune formalisation du modèle économique ou des plans.",
      },
      "2": {
        en: "A business plan is currently being drawn up with assumptions about demand, business canvas, etc.",
        fr: "Un plan d'affaires est actuellement en cours d'élaboration avec des hypothèses sur la demande, le canevas commercial, etc.",
      },
      "3": {
        en: "The proposal of concept indicates strong potential to achieve strategic objectives (costs, usage, main points of vigilance) for future developments.",
        fr: "La proposition de concept indique un fort potentiel pour atteindre les objectifs stratégiques (coûts, utilisation, principaux points de vigilance) pour les développements futurs.",
      },
      "4": {
        en: "Market study and insight are clarified with actual data (real problems, value) side use with real data (problems, value).",
        fr: "L'étude de marché et les perspectives sont clarifiées avec des données réelles (problèmes réels, valeur) utilisation avec des données réelles (problèmes, valeur).",
      },
      "5": {
        en: "The purpose of business plan, including value proposition, is clarified with client side use with real data (problems, value).",
        fr: "L'objectif du plan d'affaires, y compris la proposition de valeur, est clarifié avec l'utilisation côté client avec des données réelles (problèmes, valeur).",
      },
      "6": {
        en: "An MVP supports the value proposition and tests data and justification for early-adoption hypothesis with client side use with real data (problems, value).",
        fr: "Un MVP soutient la proposition de valeur et teste les données et la justification pour l'hypothèse d'adoption précoce avec l'utilisation côté client avec des données réelles (problèmes, valeur).",
      },
      "7": {
        en: "Integration of building variants and suggestion (co-design with clients). The cost structure is consolidated, but monitoring for adjustment before commercial is not yet effective.",
        fr: "Intégration de variantes de construction et suggestion (co-conception avec les clients). La structure de coûts est consolidée, mais la surveillance pour l'ajustement avant commercial n'est pas encore effective.",
      },
      "8": {
        en: "Data and justification for early-adoption hypothesis with perceived relevance validated and tested with early targets, and hypothesis of volumes. The business model is validated by demonstration and KPIs, but final monitoring has not been set to daily consolidated by launch.",
        fr: "Données et justification pour l'hypothèse d'adoption précoce avec pertinence perçue validée et testée avec les cibles précoces, et hypothèse de volumes. Le modèle économique est validé par la démonstration et les KPI, mais la surveillance finale n'a pas été définie pour être consolidée quotidiennement au lancement.",
      },
      "9": {
        en: "A comprehensive system is manufactured and implemented at large scale (market production) & industrial manufacturing process. The business model has been validated, but monitoring and adjustment after production is not yet stabilized or formalized. The business model is adjusted, but post-operations stabilization where it is not yet stabilized.",
        fr: "Un système complet est fabriqué et mis en œuvre à grande échelle (production de marché) et processus de fabrication industrielle. Le modèle économique a été validé, mais la surveillance et l'ajustement après la production ne sont pas encore stabilisés ou formalisés. Le modèle économique est ajusté, mais la stabilisation post-opérations où il n'est pas encore stabilisé.",
      },
    },
    MfRL_Q4: {
      "1": {
        en: "No quality system or control in place.",
        fr: "Aucun système qualité ou contrôle en place.",
      },
      "2": {
        en: "An initial material organization has been assembled.",
        fr: "Une organisation matérielle initiale a été assemblée.",
      },
      "3": {
        en: "Production constraints are beginning to be in place.",
        fr: "Les contraintes de production commencent à être en place.",
      },
      "4": {
        en: "Technical specifications and industrial processes are defined.",
        fr: "Les spécifications techniques et les processus industriels sont définis.",
      },
      "5": {
        en: "Quality control criteria are drawn up by the production documentation is available and validated by the test.",
        fr: "Les critères de contrôle qualité sont établis par la documentation de production qui est disponible et validée par le test.",
      },
      "6": {
        en: "Production documentation is available and validated by the manufacturing organization.",
        fr: "La documentation de production est disponible et validée par l'organisation de fabrication.",
      },
      "7": {
        en: "Industrial resources are installed and validated successful real case.",
        fr: "Les ressources industrielles sont installées et validées avec succès dans un cas réel.",
      },
      "8": {
        en: "Quality, manufacturing and implementation monitor of the full project as a real site. Logistics are efficient with traceability labeling, all guarantee information, warranty. Tools are maintained, operators are properly trained, and quality control is continuously integrated and managed. Production is operational, but the monitoring and updating of measurement and performance monitoring skilled operators and the.",
        fr: "Surveillance de la qualité, de la fabrication et de la mise en œuvre du projet complet comme un site réel. La logistique est efficace avec étiquetage de traçabilité, toutes les informations de garantie. Les outils sont maintenus, les opérateurs sont correctement formés, et le contrôle qualité est continuellement intégré et géré. La production est opérationnelle, mais la surveillance et la mise à jour de la mesure et du suivi des performances des opérateurs qualifiés et le.",
      },
      "9": {
        en: "Quality control is continuously integrated and managed for commercial and industrial purposes. Production systems and protocols for industrial infrastructure and systems are daily consolidated. Warranty and the comprehensive monitoring system and serial quality control.",
        fr: "Le contrôle qualité est continuellement intégré et géré à des fins commerciales et industrielles. Les systèmes de production et protocoles pour l'infrastructure industrielle et les systèmes sont consolidés quotidiennement. Garantie et système de surveillance complet et contrôle qualité en série.",
      },
    },
  },
  serviceSatisfactionOptions: {
    TRL_Q1: {
      "1": {
        en: "Initial formalization of the concept",
        fr: "Formalisation initiale du concept",
      },
      "2": {
        en: "Describe the solution and perform a state-of-the-art analysis",
        fr: "Décrire la solution et effectuer une analyse de l'état de l'art",
      },
      "3": {
        en: "Select and describe main components",
        fr: "Sélectionner et décrire les composants principaux",
      },
      "4": {
        en: "Document the entire product and its interfaces",
        fr: "Documenter l'ensemble du produit et ses interfaces",
      },
      "5": {
        en: "Describe product implementation and integration",
        fr: "Décrire la mise en œuvre et l'intégration du produit",
      },
      "6": {
        en: "Carry out experimental implementation and document feedback",
        fr: "Réaliser une mise en œuvre expérimentale et documenter les retours",
      },
      "7": {
        en: "Set up KPI monitoring dashboard",
        fr: "Mettre en place un tableau de bord de suivi des KPI",
      },
      "8": {
        en: "Finalize and consolidate the technical file",
        fr: "Finaliser et consolider le dossier technique",
      },
    },
    TRL_Q2: {
      "1": {
        en: "Create a first sketch or preliminary diagram",
        fr: "Créer une première esquisse ou un schéma préliminaire",
      },
      "2": {
        en: "Produce 3D views or simplified digital models",
        fr: "Produire des vues 3D ou des modèles numériques simplifiés",
      },
      "3": {
        en: "Create CAD models and technical drawings",
        fr: "Créer des modèles CAO et des plans techniques",
      },
      "4": {
        en: "Develop detailed CAD/BIM model",
        fr: "Développer un modèle CAO/BIM détaillé",
      },
      "5": {
        en: "Update CAD/BIM model with feedback from pilot project",
        fr: "Mettre à jour le modèle CAO/BIM avec les retours du projet pilote",
      },
      "6": {
        en: "Use CAD/BIM for design and monitoring of a pilot project",
        fr: "Utiliser la CAO/BIM pour la conception et le suivi d'un projet pilote",
      },
      "7": {
        en: "Finalize CAD/BIM for commercial distribution",
        fr: "Finaliser la CAO/BIM pour la distribution commerciale",
      },
      "8": {
        en: "Optimize and standardize for industrial deployment",
        fr: "Optimiser et standardiser pour le déploiement industriel",
      },
    },
    TRL_Q3: {
      "1": {
        en: "Design and manufacture first prototype",
        fr: "Concevoir et fabriquer le premier prototype",
      },
      "2": {
        en: "Carry out feasibility tests",
        fr: "Effectuer des tests de faisabilité",
      },
      "3": {
        en: "Perform integrated tests",
        fr: "Effectuer des tests intégrés",
      },
      "4": {
        en: "Carry out tests under realistic conditions",
        fr: "Effectuer des tests dans des conditions réalistes",
      },
      "5": {
        en: "Install and test the prototype in a real environment",
        fr: "Installer et tester le prototype dans un environnement réel",
      },
      "6": {
        en: "Measure and document performance",
        fr: "Mesurer et documenter les performances",
      },
      "7": {
        en: "Evaluate in multiple application contexts",
        fr: "Évaluer dans plusieurs contextes d'application",
      },
      "8": {
        en: "Perform final large-scale validation",
        fr: "Effectuer la validation finale à grande échelle",
      },
    },
    TRL_Q4: {
      "1": {
        en: "Initial functional validation",
        fr: "Validation fonctionnelle initiale",
      },
      "2": {
        en: "Performance tests on components",
        fr: "Tests de performance sur les composants",
      },
      "3": {
        en: "Integration and operational tests",
        fr: "Tests d'intégration et opérationnels",
      },
      "4": {
        en: "Define performance indicators and demonstration",
        fr: "Définir les indicateurs de performance et démonstration",
      },
      "5": {
        en: "Test in representative environments",
        fr: "Tester dans des environnements représentatifs",
      },
      "6": {
        en: "Complete demonstration on pilot site",
        fr: "Démonstration complète sur site pilote",
      },
      "7": {
        en: "Extend validation to multiple pilot sites",
        fr: "Étendre la validation à plusieurs sites pilotes",
      },
      "8": {
        en: "Performance validation and certification",
        fr: "Validation des performances et certification",
      },
    },
    TRL_Q5: {
      "1": {
        en: "Identify potential manufacturing processes",
        fr: "Identifier les processus de fabrication potentiels",
      },
      "2": {
        en: "Carry out small-scale manufacturing trials",
        fr: "Effectuer des essais de fabrication à petite échelle",
      },
      "3": {
        en: "Precisely define manufacturing processes",
        fr: "Définir précisément les processus de fabrication",
      },
      "4": {
        en: "Set up a pilot or semi-industrial line",
        fr: "Mettre en place une ligne pilote ou semi-industrielle",
      },
      "5": {
        en: "Determine maintenance needs and plan sustainability",
        fr: "Déterminer les besoins de maintenance et planifier la durabilité",
      },
      "6": {
        en: "Implement monitoring during operation",
        fr: "Mettre en œuvre la surveillance pendant l'exploitation",
      },
      "7": {
        en: "Carry out long-term testing",
        fr: "Effectuer des tests à long terme",
      },
      "8": {
        en: "Optimize and scale for multi-site sustainability",
        fr: "Optimiser et mettre à l'échelle pour la durabilité multi-sites",
      },
    },
    TRL_Q6: {
      "1": {
        en: "Initial qualitative assessment of environmental impact",
        fr: "Évaluation qualitative initiale de l'impact environnemental",
      },
      "2": {
        en: "Identify sources of impact and collect environmental data",
        fr: "Identifier les sources d'impact et collecter des données environnementales",
      },
      "3": {
        en: "Comparative environmental analysis (benchmark)",
        fr: "Analyse environnementale comparative (benchmark)",
      },
      "4": {
        en: "Complete life cycle assessment (LCA)",
        fr: "Évaluation complète du cycle de vie (ACV)",
      },
      "5": {
        en: "Identify standards and applicable certifications",
        fr: "Identifier les normes et certifications applicables",
      },
      "6": {
        en: "Verify compliance and initiate certification",
        fr: "Vérifier la conformité et initier la certification",
      },
      "7": {
        en: "Integrate eco-design and sustainability principles",
        fr: "Intégrer les principes d'éco-conception et de durabilité",
      },
      "8": {
        en: "Assess and communicate overall sustainability",
        fr: "Évaluer et communiquer la durabilité globale",
      },
    },
    TRL_Q7: {
      "1": {
        en: "Conduct an in-depth market analysis",
        fr: "Effectuer une analyse de marché approfondie",
      },
      "2": {
        en: "Develop models or prototypes to validate value proposition",
        fr: "Développer des modèles ou prototypes pour valider la proposition de valeur",
      },
      "3": {
        en: "Create a functional MVP (Minimum Viable Product)",
        fr: "Créer un MVP (Produit Minimum Viable) fonctionnel",
      },
      "4": {
        en: "Establish feedback process and confirm benefits",
        fr: "Établir un processus de retour et confirmer les avantages",
      },
      "5": {
        en: "Consolidate test bench and validate performance",
        fr: "Consolider le banc d'essai et valider les performances",
      },
      "6": {
        en: "Conduct post-use surveys and confirm alignment",
        fr: "Effectuer des enquêtes post-utilisation et confirmer l'alignement",
      },
      "7": {
        en: "Deploy pilot project or demonstrations",
        fr: "Déployer un projet pilote ou des démonstrations",
      },
      "8": {
        en: "Implement sales and marketing strategy",
        fr: "Mettre en œuvre une stratégie de vente et de marketing",
      },
    },
    MkRL_Q1: {
      "1": {
        en: "Define a clear development strategy aligned with market vision",
        fr: "Définir une stratégie de développement claire alignée sur la vision du marché",
      },
      "2": {
        en: "Carry out a detailed competitive analysis",
        fr: "Effectuer une analyse concurrentielle détaillée",
      },
      "3": {
        en: "Formalize roles, responsibilities and stakeholder commitment",
        fr: "Formaliser les rôles, responsabilités et l'engagement des parties prenantes",
      },
      "4": {
        en: "Formalize testing and engagement strategy",
        fr: "Formaliser la stratégie de test et d'engagement",
      },
      "5": {
        en: "Define a plan for validating KPIs in real-life conditions",
        fr: "Définir un plan pour valider les KPI en conditions réelles",
      },
      "6": {
        en: "Implement success measurement tools at pilot site",
        fr: "Mettre en œuvre des outils de mesure du succès sur site pilote",
      },
      "7": {
        en: "Analyze real data from early users",
        fr: "Analyser les données réelles des premiers utilisateurs",
      },
      "8": {
        en: "Finalize and consolidate the Business Model",
        fr: "Finaliser et consolider le modèle d'affaires",
      },
    },
    MkRL_Q2: {
      "1": {
        en: "Conduct customer surveys to validate assumptions and pricing",
        fr: "Effectuer des enquêtes clients pour valider les hypothèses et la tarification",
      },
      "2": {
        en: "Deploy real-life pricing and value tests (A/B testing)",
        fr: "Déployer des tests de tarification et de valeur en conditions réelles (tests A/B)",
      },
      "3": {
        en: "Conduct usage and pricing tests with the MVP",
        fr: "Effectuer des tests d'utilisation et de tarification avec le MVP",
      },
      "4": {
        en: "Identify and engage early adopters",
        fr: "Identifier et engager les premiers adopteurs",
      },
      "5": {
        en: "Analyze real data from early users",
        fr: "Analyser les données réelles des premiers utilisateurs",
      },
      "6": {
        en: "Conduct first cost validation at first production site",
        fr: "Effectuer la première validation des coûts sur le premier site de production",
      },
      "7": {
        en: "Implement post-launch cost tracking system",
        fr: "Mettre en œuvre un système de suivi des coûts post-lancement",
      },
      "8": {
        en: "Implement market monitoring and price adjustment process",
        fr: "Mettre en œuvre un processus de surveillance du marché et d'ajustement des prix",
      },
    },
    MkRL_Q3: {
      "1": {
        en: "Detail organization, roles, skills and equipment",
        fr: "Détailler l'organisation, les rôles, les compétences et l'équipement",
      },
      "2": {
        en: "Carry out pilot production tests",
        fr: "Effectuer des tests de production pilote",
      },
      "3": {
        en: "Compare organization and flows with digital models",
        fr: "Comparer l'organisation et les flux avec des modèles numériques",
      },
      "4": {
        en: "Plan and start small-scale prototype production",
        fr: "Planifier et démarrer la production de prototypes à petite échelle",
      },
      "5": {
        en: "Implement full-scale prototype in representative environment",
        fr: "Mettre en œuvre un prototype à grande échelle dans un environnement représentatif",
      },
      "6": {
        en: "Conduct load and cadence testing",
        fr: "Effectuer des tests de charge et de cadence",
      },
      "7": {
        en: "Conduct real life performance tests",
        fr: "Effectuer des tests de performance en conditions réelles",
      },
      "8": {
        en: "Deploy complete traceability system and formalize balancing rules",
        fr: "Déployer un système de traçabilité complet et formaliser les règles d'équilibrage",
      },
    },
    MkRL_Q4: {
      "1": {
        en: "Confirm technical feasibility through targeted tests",
        fr: "Confirmer la faisabilité technique par des tests ciblés",
      },
      "2": {
        en: "Integrate exploratory components into mockups",
        fr: "Intégrer des composants exploratoires dans des maquettes",
      },
      "3": {
        en: "Conduct systematic laboratory testing of prototypes",
        fr: "Effectuer des tests systématiques en laboratoire des prototypes",
      },
      "4": {
        en: "Implement complete prototypes on advanced test site",
        fr: "Mettre en œuvre des prototypes complets sur site de test avancé",
      },
      "5": {
        en: "Model and refine logistics flows with partners",
        fr: "Modéliser et affiner les flux logistiques avec les partenaires",
      },
      "6": {
        en: "Deploy the complete system in representative environment",
        fr: "Déployer le système complet dans un environnement représentatif",
      },
      "7": {
        en: "Designate and train a pilot operator",
        fr: "Désigner et former un opérateur pilote",
      },
      "8": {
        en: "Implement maintenance and update plan for measurement tools",
        fr: "Mettre en œuvre un plan de maintenance et de mise à jour des outils de mesure",
      },
    },
    MfRL_Q1: {
      "1": {
        en: "Develop prototypes and models to refine cost estimates",
        fr: "Développer des prototypes et des modèles pour affiner les estimations de coûts",
      },
      "2": {
        en: "Finalize integration of variants into cost calculation",
        fr: "Finaliser l'intégration des variantes dans le calcul des coûts",
      },
      "3": {
        en: "Integrate pricing strategy and business plan into cost validation",
        fr: "Intégrer la stratégie de tarification et le plan d'affaires dans la validation des coûts",
      },
      "4": {
        en: "Produce a prototype or small series to validate actual production cost",
        fr: "Produire un prototype ou une petite série pour valider le coût de production réel",
      },
      "5": {
        en: "Identify and engage early adopters",
        fr: "Identifier et engager les premiers adopteurs",
      },
      "6": {
        en: "Extend testing to several pilot projects",
        fr: "Étendre les tests à plusieurs projets pilotes",
      },
      "7": {
        en: "Set up KPI monitoring dashboard",
        fr: "Mettre en place un tableau de bord de suivi des KPI",
      },
      "8": {
        en: "Deploy mechanism for continuous monitoring and adjustment",
        fr: "Déployer un mécanisme de surveillance continue et d'ajustement",
      },
    },
    MfRL_Q2: {
      "1": {
        en: "Define detailed logistics flows (physical and information)",
        fr: "Définir les flux logistiques détaillés (physiques et d'information)",
      },
      "2": {
        en: "Ensure integration of supply chain with manufacturing processes",
        fr: "Assurer l'intégration de la chaîne d'approvisionnement avec les processus de fabrication",
      },
      "3": {
        en: "Identify and contract with key logistics partners",
        fr: "Identifier et contracter avec les partenaires logistiques clés",
      },
      "4": {
        en: "Model and refine logistics flows with partners",
        fr: "Modéliser et affiner les flux logistiques avec les partenaires",
      },
      "5": {
        en: "Carry out quality and compliance audit on site",
        fr: "Effectuer un audit de qualité et de conformité sur site",
      },
      "6": {
        en: "Deploy complete traceability system and formalize balancing rules",
        fr: "Déployer un système de traçabilité complet et formaliser les règles d'équilibrage",
      },
      "7": {
        en: "Ensure alignment of logistics with production plan (S&OP)",
        fr: "Assurer l'alignement de la logistique avec le plan de production (S&OP)",
      },
      "8": {
        en: "Establish feedback loop for continuous improvement",
        fr: "Établir une boucle de rétroaction pour l'amélioration continue",
      },
    },
    MfRL_Q3: {
      "1": {
        en: "Define a clear development strategy aligned with market vision",
        fr: "Définir une stratégie de développement claire alignée sur la vision du marché",
      },
      "2": {
        en: "Carry out a detailed competitive analysis",
        fr: "Effectuer une analyse concurrentielle détaillée",
      },
      "3": {
        en: "Formalize roles, responsibilities and stakeholder commitment",
        fr: "Formaliser les rôles, responsabilités et l'engagement des parties prenantes",
      },
      "4": {
        en: "Structure customer return and continuous improvement processes",
        fr: "Structurer les processus de retour client et d'amélioration continue",
      },
      "5": {
        en: "Deploy pilot project or demonstrations",
        fr: "Déployer un projet pilote ou des démonstrations",
      },
      "6": {
        en: "Implement sales and marketing strategy",
        fr: "Mettre en œuvre une stratégie de vente et de marketing",
      },
      "7": {
        en: "Test under extreme conditions and validate actual performance",
        fr: "Tester dans des conditions extrêmes et valider les performances réelles",
      },
      "8": {
        en: "Optimize, automate and certify the process",
        fr: "Optimiser, automatiser et certifier le processus",
      },
    },
    MfRL_Q4: {
      "1": {
        en: "Write detailed technical and process specifications",
        fr: "Rédiger des spécifications techniques et de processus détaillées",
      },
      "2": {
        en: "Write specific quality control sheets for critical services",
        fr: "Rédiger des fiches de contrôle qualité spécifiques pour les services critiques",
      },
      "3": {
        en: "Install and validate production documentation on workstations",
        fr: "Installer et valider la documentation de production sur les postes de travail",
      },
      "4": {
        en: "Validate and test industrial resources (machines, tools)",
        fr: "Valider et tester les ressources industrielles (machines, outils)",
      },
      "5": {
        en: "Certify qualified operator and standardize practices",
        fr: "Certifier l'opérateur qualifié et normaliser les pratiques",
      },
      "6": {
        en: "Implement maintenance and update plan for measurement tools",
        fr: "Mettre en œuvre un plan de maintenance et de mise à jour des outils de mesure",
      },
      "7": {
        en: "Optimize non-conformity management and continuous improvement",
        fr: "Optimiser la gestion des non-conformités et l'amélioration continue",
      },
      "8": {
        en: "Formalize and optimize S&OP processes",
        fr: "Formaliser et optimiser les processus S&OP",
      },
    },
  },
}
