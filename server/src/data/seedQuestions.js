export const seedQuestions = [
  /* =========================================================================
     1. QUANTITATIVE APTITUDE
     ========================================================================= */
  {
    category: 'aptitude',
    subCategory: 'Time & Work',
    question: 'A can do a piece of work in 12 days and B can do it in 18 days. If they work together for 4 days, what fraction of the work remains to be finished?',
    options: ['1/3', '4/9', '5/9', '7/18'],
    correctOption: 1,
    explanation: 'Work done by A in 1 day = 1/12.\nWork done by B in 1 day = 1/18.\nCombined work in 1 day = (1/12) + (1/18) = (3 + 2)/36 = 5/36.\nWork done in 4 days = 4 * (5/36) = 20/36 = 5/9.\nRemaining work = 1 - 5/9 = 4/9.',
    difficulty: 'Easy',
    tags: ['Aptitude', 'Time and Work', 'TCS', 'Infosys']
  },
  {
    category: 'aptitude',
    subCategory: 'Time & Work',
    question: 'A and B together can complete a project in 15 days. B alone can do it in 20 days. In how many days can A alone finish the project?',
    options: ['40 days', '50 days', '60 days', '45 days'],
    correctOption: 2,
    explanation: "A's 1-day work = (A + B)'s 1-day work - B's 1-day work\n= (1/15) - (1/20)\nLCM of 15 and 20 is 60.\n= (4 - 3)/60 = 1/60.\nTherefore, A alone can complete the work in 60 days.",
    difficulty: 'Easy',
    tags: ['Aptitude', 'Time and Work', 'Wipro']
  },
  {
    category: 'aptitude',
    subCategory: 'Speed, Distance & Time',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    options: ['65 seconds', '89 seconds', '100 seconds', '75 seconds'],
    correctOption: 1,
    explanation: 'Speed of train = Distance / Time = 240 m / 24 s = 10 m/s.\nTo pass platform, total distance = train length + platform length = 240 + 650 = 890 m.\nTime required = Total Distance / Speed = 890 / 10 = 89 seconds.',
    difficulty: 'Medium',
    tags: ['Aptitude', 'Speed Distance Time', 'Cognizant']
  },
  {
    category: 'aptitude',
    subCategory: 'Speed, Distance & Time',
    question: 'A man travels from town A to town B at 60 km/h and returns from B to A at 40 km/h. What is his average speed for the entire round trip?',
    options: ['50 km/h', '48 km/h', '52 km/h', '46 km/h'],
    correctOption: 1,
    explanation: 'When distance is constant both ways, Average Speed = (2 * S1 * S2) / (S1 + S2).\nAverage Speed = (2 * 60 * 40) / (60 + 40) = 4800 / 100 = 48 km/h.\nNote: Simple arithmetic mean (50 km/h) is incorrect because travel times are unequal.',
    difficulty: 'Medium',
    tags: ['Aptitude', 'Average Speed', 'Accenture']
  },
  {
    category: 'aptitude',
    subCategory: 'Profit & Loss',
    question: 'A shopkeeper sells an article at a profit of 12%. If he had bought it at 10% less and sold it for $9 less, he would have gained 20%. What was the original cost price?',
    options: ['$450', '$500', '$375', '$420'],
    correctOption: 0,
    explanation: 'Let original Cost Price = 100x.\nOriginal Selling Price = 112x.\nNew Cost Price = 90x.\nNew Selling Price at 20% gain = 90x * 1.20 = 108x.\nDifference = 112x - 108x = 4x.\nGiven 4x = $9 => x = 9/4 = 2.25.\nOriginal CP = 100 * 2.25 = $450.',
    difficulty: 'Hard',
    tags: ['Aptitude', 'Profit and Loss', 'Amazon']
  },
  {
    category: 'aptitude',
    subCategory: 'Percentages',
    question: 'In an election between two candidates, the winner received 56% of total valid votes and won by a majority of 1,440 votes. If 10% of votes polled were declared invalid, how many total votes were polled?',
    options: ['12,000', '13,333', '14,000', '15,000'],
    correctOption: 1,
    explanation: 'Let total valid votes = V.\nWinner got 56% of V, Loser got 44% of V.\nDifference = 56% - 44% = 12% of V = 1,440 => V = 1,440 / 0.12 = 12,000 valid votes.\nSince 10% were invalid, Valid Votes = 90% of Total Polled (T).\n0.90 * T = 12,000 => T = 12,000 / 0.9 = 13,333.33 votes (~13,333).',
    difficulty: 'Medium',
    tags: ['Aptitude', 'Percentages', 'TCS Digital']
  },
  {
    category: 'aptitude',
    subCategory: 'Probability',
    question: 'Two fair 6-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on top is at least 10?',
    options: ['1/6', '1/12', '5/36', '7/36'],
    correctOption: 0,
    explanation: 'Total possible outcomes = 6 * 6 = 36.\nFavorable outcomes for sum >= 10:\nSum = 10: (4,6), (5,5), (6,4) -> 3 outcomes\nSum = 11: (5,6), (6,5) -> 2 outcomes\nSum = 12: (6,6) -> 1 outcome\nTotal favorable outcomes = 3 + 2 + 1 = 6.\nProbability = 6 / 36 = 1/6.',
    difficulty: 'Easy',
    tags: ['Aptitude', 'Probability', 'Capgemini']
  },
  {
    category: 'aptitude',
    subCategory: 'Permutations & Combinations',
    question: 'In how many different ways can the letters of the word "LEADING" be arranged such that the vowels always appear together?',
    options: ['360', '720', '5040', '1440'],
    correctOption: 1,
    explanation: 'Word: "LEADING" (7 letters: L, D, N, G - 4 consonants; E, A, I - 3 vowels).\nTreat the 3 vowels (E, A, I) as a single consolidated block [EAI].\nNow we arrange 4 consonants + 1 block = 5 entities in 5! ways = 120.\nThe 3 vowels within their block can be arranged among themselves in 3! ways = 6.\nTotal ways = 5! * 3! = 120 * 6 = 720.',
    difficulty: 'Medium',
    tags: ['Aptitude', 'Permutations', 'Infosys']
  },

  /* =========================================================================
     2. LOGICAL REASONING
     ========================================================================= */
  {
    category: 'logical_reasoning',
    subCategory: 'Syllogisms',
    question: 'Statements:\n1. All engineers are innovators.\n2. Some innovators are designers.\nConclusions:\nI. Some engineers are designers.\nII. Some designers are innovators.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither I nor II follows'],
    correctOption: 1,
    explanation: 'Conclusion I: "Some engineers are designers" is not necessarily true because the set of designers might only intersect with innovators outside the engineer subset.\nConclusion II: "Some designers are innovators" is the direct valid conversion of statement 2 ("Some innovators are designers").\nTherefore, only conclusion II follows.',
    difficulty: 'Easy',
    tags: ['Reasoning', 'Syllogism', 'TCS']
  },
  {
    category: 'logical_reasoning',
    subCategory: 'Blood Relations',
    question: 'Pointing to a photograph, Rohit said, "She is the daughter of the only son of my grandfather." How is the girl in the photograph related to Rohit?',
    options: ['Mother', 'Sister', 'Aunt', 'Cousin'],
    correctOption: 1,
    explanation: 'Rohit\'s grandfather\'s "only son" is Rohit\'s own father.\nThe girl is the daughter of Rohit\'s father.\nTherefore, the girl is Rohit\'s sister.',
    difficulty: 'Easy',
    tags: ['Reasoning', 'Blood Relations', 'Wipro']
  },
  {
    category: 'logical_reasoning',
    subCategory: 'Coding-Decoding',
    question: 'In a certain code language, if "ORANGE" is coded as "PUCPKG", how will "PURPLE" be coded in that same pattern?',
    options: ['QWTUPJ', 'QVTTPH', 'QWTVNH', 'QWTTPH'],
    correctOption: 3,
    explanation: 'Pattern observation for ORANGE -> PUCPKG:\nO (+1) -> P\nR (+3) -> U\nA (+2) -> C\nN (+2) -> P\nG (+4) -> K\nE (+2) -> G\nNotice alternating additions: +1, +3, +2, +2, +4, +2.\nApplying pattern to PURPLE:\nP (+1) = Q\nU (+2) = W\nR (+2) = T\nP (+4) = T\nL (+4) = P\nE (+3) = H -> QWTTPH.',
    difficulty: 'Medium',
    tags: ['Reasoning', 'Coding-Decoding', 'Accenture']
  },
  {
    category: 'logical_reasoning',
    subCategory: 'Direction Sense',
    question: 'A cyclist rides 12 km North, turns right and rides 9 km. He then turns right again and rides 12 km South. Finally, he turns left and rides 6 km. How far is he from his starting point?',
    options: ['15 km', '21 km', '12 km', '9 km'],
    correctOption: 0,
    explanation: 'Vertical movement: 12 km North - 12 km South = 0 km (back on original latitude line).\nHorizontal movement: 9 km East + 6 km East = 15 km East.\nTotal displacement from start = 15 km due East.',
    difficulty: 'Easy',
    tags: ['Reasoning', 'Direction Sense', 'Cognizant']
  },
  {
    category: 'logical_reasoning',
    subCategory: 'Seating Arrangement',
    question: 'Five colleagues (P, Q, R, S, T) sit in a straight line facing North. R is to the immediate right of Q. S is between P and T. Q is not at either extreme end, and P is at the extreme left. Who is seated in the exact middle position?',
    options: ['P', 'S', 'T', 'Q'],
    correctOption: 1,
    explanation: 'P is at the extreme left (Position 1): P _ _ _ _\nS is between P and T: So S must be at Position 2 and T at Position 3 (P, S, T, _, _).\nR is to the immediate right of Q: So Q must be Position 4, and R Position 5.\nArrangement: P (1), S (2), T (3), Q (4), R (5). Wait! T is in the exact middle (position 3) when S is between P and T!',
    options: ['P', 'S', 'T', 'Q'],
    correctOption: 2,
    explanation: 'Positions from Left to Right: 1: P, 2: S, 3: T, 4: Q, 5: R.\nT is seated at position 3, which is the exact middle of the 5 positions.',
    difficulty: 'Medium',
    tags: ['Reasoning', 'Puzzles', 'Infosys']
  },
  {
    category: 'logical_reasoning',
    subCategory: 'Series & Sequences',
    question: 'Find the missing number in the sequence: 4, 18, 48, 100, 180, ?',
    options: ['294', '280', '264', '312'],
    correctOption: 0,
    explanation: 'Pattern: n^3 - n^2 (or n^2 * (n - 1)):\nFor n=2: 2^3 - 2^2 = 8 - 4 = 4\nFor n=3: 3^3 - 3^2 = 27 - 9 = 18\nFor n=4: 4^3 - 4^2 = 64 - 16 = 48\nFor n=5: 5^3 - 5^2 = 125 - 25 = 100\nFor n=6: 6^3 - 6^2 = 216 - 36 = 180\nFor n=7: 7^3 - 7^2 = 343 - 49 = 294.',
    difficulty: 'Hard',
    tags: ['Reasoning', 'Number Series', 'Amazon']
  },

  /* =========================================================================
     3. VERBAL ABILITY
     ========================================================================= */
  {
    category: 'verbal_ability',
    subCategory: 'Spotting Errors',
    question: 'Identify the part of the sentence that contains a grammatical error: \n"Neither the team members (A) / nor the lead architect (B) / were available for comment (C) / regarding the server outage (D)."',
    options: ['Part A', 'Part B', 'Part C', 'Part D'],
    correctOption: 2,
    explanation: 'Rule of Subject-Verb Agreement with "neither... nor": When two subjects are connected by "or" or "nor", the verb agrees with the subject closest to it. Here, "lead architect" is singular, so the verb should be "was available", not "were available". Error is in Part C.',
    difficulty: 'Medium',
    tags: ['Verbal', 'Grammar', 'TCS']
  },
  {
    category: 'verbal_ability',
    subCategory: 'Vocabulary & Antonyms',
    question: 'Choose the word that is most nearly OPPOSITE in meaning to the capitalized word: "EPHEMERAL"',
    options: ['Fleeting', 'Perpetual', 'Evanescent', 'Transient'],
    correctOption: 1,
    explanation: '"Ephemeral" means lasting for a very short time (transient, fleeting). The opposite is "Perpetual", which means never-ending or permanent.',
    difficulty: 'Easy',
    tags: ['Verbal', 'Vocabulary', 'Cognizant']
  },
  {
    category: 'verbal_ability',
    subCategory: 'Sentence Improvement',
    question: 'Select the option that best improves the underlined phrase: "Had the microservices been properly containerized, the production deployment would have succeeded without downtime."',
    options: [
      'If the microservices had properly containerized',
      'Had the microservices properly containerized',
      'No improvement needed',
      'Would the microservices have been containerized'
    ],
    correctOption: 2,
    explanation: 'The sentence correctly utilizes inverted third conditional syntax ("Had + subject + past participle, subject + would have + past participle") in passive voice. It is grammatically flawless.',
    difficulty: 'Medium',
    tags: ['Verbal', 'Sentence Improvement', 'Accenture']
  },
  {
    category: 'verbal_ability',
    subCategory: 'Reading Comprehension',
    passage: 'Quantum computing represents a fundamental departure from classical binary architectures. Whereas classical computers encode discrete states as bits constrained strictly to 0 or 1, quantum processors exploit quantum mechanics principles—namely superposition and entanglement—utilizing quantum bits or qubits. In a state of superposition, a qubit represents linear combinations of simultaneous states, enabling computational parallelism that scales exponentially with the number of entangled qubits. Consequently, specific polynomial-time algorithms, such as Shor\'s algorithm for integer factorization, can disrupt conventional RSA asymmetric encryption standards, necessitating post-quantum cryptography research.',
    question: 'According to the passage, why does quantum computing pose an urgent threat to modern cryptographic systems like RSA?',
    options: [
      'Quantum computers eliminate all hardware latency and physical bit errors completely.',
      'Shor\'s algorithm enables quantum systems to factorize large integers in polynomial time.',
      'Binary classical logic can no longer encode encrypted keys.',
      'Entanglement allows attackers to physically tap fiber-optic data transmission.'
    ],
    correctOption: 1,
    explanation: 'The passage explicitly states: "specific polynomial-time algorithms, such as Shor\'s algorithm for integer factorization, can disrupt conventional RSA asymmetric encryption standards."',
    difficulty: 'Medium',
    tags: ['Verbal', 'Reading Comprehension', 'Infosys']
  },

  /* =========================================================================
     4. CORE COMPUTER SCIENCE
     ========================================================================= */
  {
    category: 'core_cs',
    subCategory: 'Operating Systems',
    question: 'Which of the following conditions is NOT one of the four Coffman conditions necessary for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctOption: 2,
    explanation: 'The four necessary conditions for deadlock (Coffman conditions) are:\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption (resources cannot be forcibly taken away)\n4. Circular Wait.\nIf "Preemption is Allowed", deadlocks cannot persist!',
    difficulty: 'Easy',
    tags: ['Operating Systems', 'Deadlocks', 'Core CS', 'Gate']
  },
  {
    category: 'core_cs',
    subCategory: 'Operating Systems',
    question: 'In virtual memory systems, what is "Thrashing"?',
    options: [
      'The CPU overheating due to excessive clock cycles',
      'A condition where the operating system spends more time swapping pages in and out of disk than executing user instructions',
      'A cache eviction strategy based on least recently used items',
      'A buffer overflow exploit targeting kernel memory'
    ],
    correctOption: 1,
    explanation: 'Thrashing occurs when the system does not have enough physical memory frames to hold the working sets of active processes. The page fault rate skyrockets, causing the OS to spend virtually all its time swapping pages between RAM and disk, degrading CPU throughput to near zero.',
    difficulty: 'Medium',
    tags: ['Operating Systems', 'Virtual Memory', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'DBMS & SQL',
    question: 'What is the highest normal form satisfied by a relation where every determinant is a Candidate Key?',
    options: ['Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)', 'Fourth Normal Form (4NF)'],
    correctOption: 2,
    explanation: 'Boyce-Codd Normal Form (BCNF) is defined such that for every functional dependency X -> Y, X must be a superkey/candidate key. In 3NF, Y is allowed to be a prime attribute even if X is not a superkey, but BCNF strictly eliminates that exception.',
    difficulty: 'Medium',
    tags: ['DBMS', 'Normalization', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'DBMS & SQL',
    codeSnippet: 'SELECT dept_id, COUNT(*) as emp_count\nFROM Employees\nWHERE salary > 50000\nGROUP BY dept_id\nHAVING COUNT(*) >= 5;',
    question: 'In what exact logical order does a SQL relational engine evaluate the clauses in the provided query?',
    options: [
      'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING',
      'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT',
      'FROM -> GROUP BY -> HAVING -> WHERE -> SELECT',
      'WHERE -> FROM -> GROUP BY -> SELECT -> HAVING'
    ],
    correctOption: 1,
    explanation: 'Standard SQL execution order:\n1. FROM (identifies and joins tables)\n2. WHERE (filters individual rows)\n3. GROUP BY (aggregates rows into buckets)\n4. HAVING (filters aggregated groups)\n5. SELECT (evaluates projections and expressions)\n6. ORDER BY / LIMIT.',
    difficulty: 'Medium',
    tags: ['DBMS', 'SQL', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'Computer Networks',
    question: 'Which TCP flag combination is sent during the classic TCP 3-Way Handshake connection establishment?',
    options: [
      'SYN -> SYN-ACK -> ACK',
      'ACK -> SYN -> ACK-SYN',
      'FIN -> ACK -> FIN-ACK',
      'RST -> SYN -> ACK'
    ],
    correctOption: 0,
    explanation: 'The TCP 3-way handshake process:\n1. Client -> Server: SYN (Synchronize sequence numbers)\n2. Server -> Client: SYN-ACK (Acknowledges client and synchronizes server sequence)\n3. Client -> Server: ACK (Acknowledges server synchronization).',
    difficulty: 'Easy',
    tags: ['Computer Networks', 'TCP/IP', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'Computer Networks',
    question: 'At which OSI layer does the Address Resolution Protocol (ARP) operate to map IP addresses to MAC addresses?',
    options: ['Transport Layer (Layer 4)', 'Network Layer (Layer 3)', 'Data Link Layer (Layer 2 / between 2 and 3)', 'Application Layer (Layer 7)'],
    correctOption: 2,
    explanation: 'ARP translates Network Layer (Layer 3) IP addresses into Data Link Layer (Layer 2) hardware MAC addresses. It is encapsulated directly inside Ethernet Layer 2 frames.',
    difficulty: 'Medium',
    tags: ['Computer Networks', 'OSI Model', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'Data Structures & Algorithms',
    codeSnippet: 'int findPeakElement(int arr[], int n) {\n  int low = 0, high = n - 1;\n  while (low < high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] < arr[mid + 1]) low = mid + 1;\n    else high = mid;\n  }\n  return low;\n}',
    question: 'What is the worst-case time complexity of the binary search algorithm shown above to locate a peak element in an array?',
    options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
    correctOption: 1,
    explanation: 'The algorithm halves the search interval in each iteration (`low + (high - low)/2`), performing constant O(1) comparisons per step. Hence, its worst-case time complexity is strictly O(log N).',
    difficulty: 'Easy',
    tags: ['DSA', 'Binary Search', 'Algorithms', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'Data Structures & Algorithms',
    question: 'Which data structure is optimal for implementing an LRU (Least Recently Used) Cache with O(1) get and O(1) put operations?',
    options: [
      'Hash Table + Doubly Linked List',
      'Binary Search Tree + Array',
      'Max Heap + Singly Linked List',
      'Stack + Queue'
    ],
    correctOption: 0,
    explanation: 'A Hash Table provides O(1) key lookups to find node references, while a Doubly Linked List permits O(1) node removals and insertions at the head/tail for tracking recency without shifting array indices.',
    difficulty: 'Medium',
    tags: ['DSA', 'LRU Cache', 'System Design', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'Object Oriented Programming',
    question: 'In OOP, which SOLID principle states that "Software entities should be open for extension, but closed for modification"?',
    options: [
      'Single Responsibility Principle',
      'Open/Closed Principle (OCP)',
      'Liskov Substitution Principle (LSP)',
      'Dependency Inversion Principle (DIP)'
    ],
    correctOption: 1,
    explanation: 'The Open/Closed Principle (OCP), introduced by Bertrand Meyer, states that modules or classes should be written so that their behavior can be extended (e.g. through inheritance or interfaces) without modifying their existing source code.',
    difficulty: 'Easy',
    tags: ['OOP', 'SOLID Principles', 'Core CS']
  },
  {
    category: 'core_cs',
    subCategory: 'Software Engineering',
    question: 'In continuous integration and deployment (CI/CD), what is "Canary Deployment"?',
    options: [
      'Taking down the entire server fleet for scheduled weekend updates',
      'Routing a small percentage of real user traffic to the new software release while monitoring error rates before complete rollout',
      'Deploying two identical production environments (Blue and Green) and flipping router switches instantaneously',
      'Running automated unit tests in isolated virtual containers before committing to Git'
    ],
    correctOption: 1,
    explanation: 'Canary Deployment involves releasing software updates to a small subset of servers or users first (the "canary in the coal mine"). If metrics, error rates, and latency look healthy, rollout is incrementally increased to 100%.',
    difficulty: 'Medium',
    tags: ['Software Engineering', 'CI/CD', 'DevOps', 'Core CS']
  }
];
