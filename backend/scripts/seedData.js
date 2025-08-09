const mongoose = require('mongoose');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const connectDB = require('../Db/db');
require('dotenv').config();


// Connect to MongoDB
connectDB();

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed database...');

    // Clear existing data
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@oslp.com',
      password: 'Admin123!',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Seed modules
    const modules = [
      {
        title: 'Introduction to Operating Systems',
        slug: 'intro-to-os',
        description: 'Learn the fundamentals of operating systems, their purpose, and basic concepts.',
        category: 'process-management',
        difficulty: 'beginner',
        estimatedTime: 45,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'An operating system (OS) is system software that manages computer hardware and software resources.',
            concepts: [
              {
                title: 'What is an Operating System?',
                explanation: 'An OS acts as an intermediary between users and computer hardware.',
                examples: ['Windows', 'macOS', 'Linux', 'Android'],
                diagrams: []
              },
              {
                title: 'Functions of OS',
                explanation: 'Main functions include process management, memory management, file management, and I/O management.',
                examples: ['Task Manager', 'File Explorer', 'Device Manager'],
                diagrams: []
              }
            ],
            summary: 'Operating systems provide essential services for computer systems to function efficiently.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <stdio.h>\n#include <unistd.h>\n\nint main() {\n    printf("Process ID: %d\\n", getpid());\n    return 0;\n}',
              explanation: 'Simple C program to get process ID using system call'
            }
          ],
          resources: [
            {
              title: 'OS Concepts by Silberschatz',
              type: 'book',
              url: '#',
              description: 'Comprehensive textbook on operating systems'
            }
          ]
        },
        simulator: {
          type: 'cpu-scheduling',
          config: { algorithms: ['fcfs', 'sjf', 'round-robin'] }
        },
        order: 1,
        createdBy: adminUser._id,
        tags: ['basics', 'introduction', 'fundamentals']
      },
      {
        title: 'Process Management',
        slug: 'process-management',
        description: 'Understanding processes, process states, and process control blocks.',
        category: 'process-management',
        difficulty: 'beginner',
        estimatedTime: 60,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'A process is a program in execution. Process management involves creating, scheduling, and terminating processes.',
            concepts: [
              {
                title: 'Process States',
                explanation: 'Processes can be in different states: new, ready, running, waiting, and terminated.',
                examples: ['Running process', 'Blocked process', 'Ready queue'],
                diagrams: []
              },
              {
                title: 'Process Control Block (PCB)',
                explanation: 'PCB contains information about a process including process ID, state, program counter, and registers.',
                examples: ['Process ID: 1234', 'State: Running', 'Priority: 5'],
                diagrams: []
              }
            ],
            summary: 'Process management is crucial for multitasking and system efficiency.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <sys/types.h>\n#include <unistd.h>\n\nint main() {\n    pid_t pid = fork();\n    if (pid == 0) {\n        // Child process\n        printf("Child process\\n");\n    } else {\n        // Parent process\n        printf("Parent process\\n");\n    }\n    return 0;\n}',
              explanation: 'Creating a new process using fork() system call'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'cpu-scheduling',
          config: { algorithms: ['fcfs', 'sjf', 'round-robin', 'priority'] }
        },
        order: 2,
        createdBy: adminUser._id,
        tags: ['processes', 'PCB', 'states']
      },
      {
        title: 'CPU Scheduling Algorithms',
        slug: 'cpu-scheduling',
        description: 'Learn various CPU scheduling algorithms like FCFS, SJF, Round Robin, and Priority scheduling.',
        category: 'cpu-scheduling',
        difficulty: 'intermediate',
        estimatedTime: 90,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'CPU scheduling determines which process runs next on the CPU to maximize system efficiency.',
            concepts: [
              {
                title: 'First Come First Served (FCFS)',
                explanation: 'Processes are executed in the order they arrive. Simple but can cause convoy effect.',
                examples: ['P1 arrives first, executes first', 'Non-preemptive'],
                diagrams: []
              },
              {
                title: 'Shortest Job First (SJF)',
                explanation: 'Process with shortest burst time executes first. Optimal for average waiting time.',
                examples: ['P1: 6ms, P2: 8ms, P3: 7ms → P1, P3, P2'],
                diagrams: []
              },
              {
                title: 'Round Robin (RR)',
                explanation: 'Each process gets equal time quantum. Preemptive and fair.',
                examples: ['Time quantum = 4ms', 'Preemptive scheduling'],
                diagrams: []
              }
            ],
            summary: 'Different scheduling algorithms optimize for different criteria like waiting time, response time, and fairness.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '// FCFS Scheduling\nvoid fcfs(struct process proc[], int n) {\n    int waiting_time = 0;\n    for(int i = 0; i < n; i++) {\n        proc[i].waiting_time = waiting_time;\n        waiting_time += proc[i].burst_time;\n    }\n}',
              explanation: 'Implementation of FCFS scheduling algorithm'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'cpu-scheduling',
          config: { algorithms: ['fcfs', 'sjf', 'round-robin', 'priority'] }
        },
        order: 3,
        createdBy: adminUser._id,
        tags: ['scheduling', 'algorithms', 'CPU']
      },
      {
        title: 'Deadlocks and Synchronization',
        slug: 'deadlocks-sync',
        description: 'Understanding deadlocks, their conditions, prevention, and synchronization mechanisms.',
        category: 'deadlock-sync',
        difficulty: 'advanced',
        estimatedTime: 120,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'Deadlock occurs when processes are blocked forever, each waiting for the other to release resources.',
            concepts: [
              {
                title: 'Deadlock Conditions',
                explanation: 'Four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
                examples: ['Two processes, two resources', 'Each holds one, needs the other'],
                diagrams: []
              },
              {
                title: 'Semaphores',
                explanation: 'Semaphores are integer variables used for process synchronization.',
                examples: ['Binary semaphore (mutex)', 'Counting semaphore'],
                diagrams: []
              },
              {
                title: 'Monitors',
                explanation: 'High-level synchronization construct that provides mutual exclusion automatically.',
                examples: ['Condition variables', 'Wait and signal operations'],
                diagrams: []
              }
            ],
            summary: 'Proper synchronization prevents deadlocks and ensures data consistency in concurrent systems.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <semaphore.h>\n\nsem_t mutex;\n\nvoid critical_section() {\n    sem_wait(&mutex);  // P operation\n    // Critical section code\n    printf("In critical section\\n");\n    sem_post(&mutex);  // V operation\n}',
              explanation: 'Using semaphore for mutual exclusion'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'deadlock-detection',
          config: { maxProcesses: 5, maxResources: 4 }
        },
        order: 4,
        createdBy: adminUser._id,
        tags: ['deadlock', 'synchronization', 'semaphores']
      },
      {
        title: 'Memory Management',
        slug: 'memory-management',
        description: 'Learn about memory allocation, paging, segmentation, and virtual memory.',
        category: 'memory-management',
        difficulty: 'intermediate',
        estimatedTime: 100,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'Memory management involves allocating and deallocating memory space for processes efficiently.',
            concepts: [
              {
                title: 'Paging',
                explanation: 'Memory is divided into fixed-size blocks called pages. Enables non-contiguous allocation.',
                examples: ['Page size: 4KB', 'Page table mapping', 'Virtual to physical address'],
                diagrams: []
              },
              {
                title: 'Segmentation',
                explanation: 'Memory is divided into variable-size segments based on logical divisions.',
                examples: ['Code segment', 'Data segment', 'Stack segment'],
                diagrams: []
              },
              {
                title: 'Virtual Memory',
                explanation: 'Technique that allows execution of processes larger than main memory.',
                examples: ['Page replacement', 'Demand paging', 'Thrashing'],
                diagrams: []
              }
            ],
            summary: 'Memory management techniques optimize memory usage and enable multiprogramming.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <stdlib.h>\n\nint main() {\n    // Dynamic memory allocation\n    int *ptr = (int*)malloc(sizeof(int) * 10);\n    if (ptr != NULL) {\n        // Use allocated memory\n        free(ptr);  // Free memory\n    }\n    return 0;\n}',
              explanation: 'Dynamic memory allocation and deallocation'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'memory-allocation',
          config: { algorithms: ['first-fit', 'best-fit', 'worst-fit'] }
        },
        order: 5,
        createdBy: adminUser._id,
        tags: ['memory', 'paging', 'virtual-memory']
      },
      {
        title: 'File Systems',
        slug: 'file-systems',
        description: 'Understanding file organization, directory structures, and file allocation methods.',
        category: 'file-systems',
        difficulty: 'intermediate',
        estimatedTime: 80,
        prerequisites: [],
        content: {
          theory: {
            introduction: 'File systems organize and manage files on storage devices efficiently.',
            concepts: [
              {
                title: 'File Allocation Methods',
                explanation: 'Different methods to allocate disk space: contiguous, linked, and indexed allocation.',
                examples: ['Contiguous: fast access', 'Linked: no external fragmentation', 'Indexed: random access'],
                diagrams: []
              },
              {
                title: 'Directory Structure',
                explanation: 'Hierarchical organization of files and directories.',
                examples: ['Single-level', 'Two-level', 'Tree structure'],
                diagrams: []
              },
              {
                title: 'File System Interface',
                explanation: 'System calls for file operations like create, read, write, delete.',
                examples: ['open()', 'read()', 'write()', 'close()'],
                diagrams: []
              }
            ],
            summary: 'File systems provide organized storage and retrieval of data on persistent storage.'
          },
          codeExamples: [
            {
              language: 'c',
              code: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("example.txt", "w");\n    if (fp != NULL) {\n        fprintf(fp, "Hello, File System!\\n");\n        fclose(fp);\n    }\n    return 0;\n}',
              explanation: 'Basic file operations in C'
            }
          ],
          resources: []
        },
        simulator: {
          type: 'file-allocation',
          config: { methods: ['contiguous', 'linked', 'indexed'] }
        },
        order: 6,
        createdBy: adminUser._id,
        tags: ['files', 'directories', 'storage']
      }
    ];

    const createdModules = await Module.insertMany(modules);
    console.log(`📚 Created ${createdModules.length} modules`);

    // Create quizzes for each module
    const quizzes = [
      {
        title: 'Introduction to Operating Systems Quiz',
        description: 'Test your knowledge of basic OS concepts',
        module: createdModules[0]._id,
        questions: [
          {
            question: 'What is the primary function of an operating system?',
            type: 'multiple-choice',
            options: [
              { text: 'To manage hardware and software resources', isCorrect: true },
              { text: 'To create applications', isCorrect: false },
              { text: 'To provide internet connectivity', isCorrect: false },
              { text: 'To store data permanently', isCorrect: false }
            ],
            explanation: 'The primary function of an OS is to manage computer hardware and software resources and provide services to applications.',
            difficulty: 'easy',
            points: 1,
            hints: ['Think about what OS does between user and hardware'],
            tags: ['basics', 'functions']
          },
          {
            question: 'Which of the following is NOT a type of operating system?',
            type: 'multiple-choice',
            options: [
              { text: 'Batch Operating System', isCorrect: false },
              { text: 'Real-time Operating System', isCorrect: false },
              { text: 'Distributed Operating System', isCorrect: false },
              { text: 'Application Operating System', isCorrect: true }
            ],
            explanation: 'Application Operating System is not a recognized type of OS. The main types include batch, time-sharing, real-time, and distributed systems.',
            difficulty: 'medium',
            points: 2,
            hints: ['Consider the standard classifications of OS types'],
            tags: ['types', 'classification']
          }
        ],
        timeLimit: 15,
        passingScore: 70,
        difficulty: 'beginner'
      },
      {
        title: 'Process Management Quiz',
        description: 'Test your understanding of processes and their management',
        module: createdModules[1]._id,
        questions: [
          {
            question: 'What information is stored in a Process Control Block (PCB)?',
            type: 'multiple-choice',
            options: [
              { text: 'Process ID, state, and program counter', isCorrect: true },
              { text: 'Only the process ID', isCorrect: false },
              { text: 'Only the program code', isCorrect: false },
              { text: 'System hardware information', isCorrect: false }
            ],
            explanation: 'PCB stores various information about a process including process ID, current state, program counter, CPU registers, memory management information, and I/O status.',
            difficulty: 'medium',
            points: 2,
            hints: ['Think about what OS needs to know about each process'],
            tags: ['PCB', 'process-info']
          },
          {
            question: 'In which state is a process when it is waiting for I/O completion?',
            type: 'multiple-choice',
            options: [
              { text: 'Running', isCorrect: false },
              { text: 'Ready', isCorrect: false },
              { text: 'Waiting/Blocked', isCorrect: true },
              { text: 'Terminated', isCorrect: false }
            ],
            explanation: 'When a process is waiting for I/O completion, it is in the waiting or blocked state until the I/O operation completes.',
            difficulty: 'easy',
            points: 1,
            hints: ['Consider what happens when process cannot proceed'],
            tags: ['states', 'io-wait']
          }
        ],
        timeLimit: 20,
        passingScore: 70,
        difficulty: 'beginner'
      },
      {
        title: 'CPU Scheduling Quiz',
        description: 'Test your knowledge of various CPU scheduling algorithms',
        module: createdModules[2]._id,
        questions: [
          {
            question: 'Which scheduling algorithm can cause the convoy effect?',
            type: 'multiple-choice',
            options: [
              { text: 'Round Robin', isCorrect: false },
              { text: 'Shortest Job First', isCorrect: false },
              { text: 'First Come First Served', isCorrect: true },
              { text: 'Priority Scheduling', isCorrect: false }
            ],
            explanation: 'FCFS can cause convoy effect when short processes wait behind long processes, leading to poor average waiting time.',
            difficulty: 'medium',
            points: 2,
            hints: ['Think about what happens when long processes execute first'],
            tags: ['FCFS', 'convoy-effect']
          },
          {
            question: 'What is the time complexity of SJF scheduling in terms of average waiting time?',
            type: 'multiple-choice',
            options: [
              { text: 'It gives maximum average waiting time', isCorrect: false },
              { text: 'It gives minimum average waiting time', isCorrect: true },
              { text: 'It gives random average waiting time', isCorrect: false },
              { text: 'Time complexity is not related to waiting time', isCorrect: false }
            ],
            explanation: 'SJF scheduling algorithm gives the minimum average waiting time for a given set of processes.',
            difficulty: 'hard',
            points: 3,
            hints: ['Consider the mathematical proof of SJF optimality'],
            tags: ['SJF', 'optimal', 'waiting-time']
          }
        ],
        timeLimit: 25,
        passingScore: 70,
        difficulty: 'intermediate'
      }
    ];

    // Add more quizzes for remaining modules
    for (let i = 3; i < createdModules.length; i++) {
      quizzes.push({
        title: `${createdModules[i].title} Quiz`,
        description: `Test your understanding of ${createdModules[i].title.toLowerCase()}`,
        module: createdModules[i]._id,
        questions: [
          {
            question: `What is a key concept in ${createdModules[i].title}?`,
            type: 'multiple-choice',
            options: [
              { text: 'Concept A', isCorrect: true },
              { text: 'Concept B', isCorrect: false },
              { text: 'Concept C', isCorrect: false },
              { text: 'Concept D', isCorrect: false }
            ],
            explanation: `This tests basic understanding of ${createdModules[i].title}.`,
            difficulty: 'medium',
            points: 2,
            hints: ['Review the module content'],
            tags: [createdModules[i].category]
          }
        ],
        timeLimit: 20,
        passingScore: 70,
        difficulty: createdModules[i].difficulty
      });
    }

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`🧩 Created ${createdQuizzes.length} quizzes`);

    console.log('✅ Database seeded successfully!');
    console.log(`
📊 Summary:
- Admin User: admin@oslp.com (password: Admin123!)
- Modules: ${createdModules.length}
- Quizzes: ${createdQuizzes.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the seed function
if (require.main === module) {
  seedData();
}

module.exports = seedData;
