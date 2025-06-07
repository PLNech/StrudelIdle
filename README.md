# AlgoRave IDLE 🎵

An incremental idle game where players generate "Beats" to unlock code modules and hardware upgrades, with real-time audio output via [Strudel.cc](https://strudel.cc).

## 🎮 Game Overview

AlgoRave IDLE combines the addictive progression mechanics of idle games with the creative power of live coding. Players start by tapping beats manually and gradually automate their musical creation through an authentic progression system inspired by Strudel's learning pathway.

### Core Gameplay Loop
1. **Generate Beats** - Click to generate beats manually or through automated modules
2. **Purchase Modules** - Buy code modules (samples, synths, effects) that generate BPS (Beats Per Second)
3. **Upgrade Hardware** - Expand your capacity with RAM, CPU, DSP, and Storage upgrades
4. **Watch Patterns Evolve** - Your Strudel code grows organically as you unlock new capabilities
5. **Listen Live** - Experience your evolving patterns in real-time with authentic Strudel.cc audio

## 🚀 Features

### Real-Time Audio Generation
- **Strudel.cc Integration**: Authentic live coding patterns that play in your browser
- **Progressive Complexity**: Patterns evolve from simple `s("bd")` to complex mini-notation
- **Visual Feedback**: Punchcard and piano roll visualizations of your patterns
- **Interactive Controls**: BPM control, visual mode switching, and debug information

### Educational Progression
Based on the official [Strudel.cc workshop progression](https://strudel.cc/workshop/):
1. **First Sounds** - Basic sample playback (`s("bd")`, `s("hh")`)
2. **Sequences** - Mini-notation patterns (`s("bd hh sd hh")`)
3. **Effects** - Audio processing (`.lpf()`, `.delay()`, `.room()`)
4. **Advanced Features** - Polyphony, Euclidean rhythms, chord progressions

### Modern Game Mechanics
- **Hardware Constraints**: Realistic resource management with RAM/CPU/DSP limits
- **Achievement System**: Unlock rewards for progression milestones
- **News Feed**: Track your journey with contextual updates
- **Settings**: Customizable game experience

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Audio Engine**: Strudel.cc Web API
- **Styling**: Tailwind CSS with custom design system
- **Testing**: Playwright end-to-end tests
- **State Management**: React Context with custom game loop

## 📦 Installation & Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd StrudelIdle

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm test` - Run Playwright tests

## 🎯 Game Design Philosophy

### Educational First
Every game mechanic teaches real Strudel.cc concepts:
- **Modules** represent actual code patterns
- **Progression** follows the official learning pathway
- **Hardware** mirrors real music production constraints
- **Achievements** celebrate coding milestones

### Authentic Audio
- Real Strudel.cc patterns, not fake audio
- Progressive complexity that mirrors learning
- Visual feedback that enhances understanding
- Interactive controls for experimentation

### Idle Game Balance
- Satisfying progression curves
- Multiple paths to advancement
- Meaningful choices in upgrades
- Long-term engagement through unlocks

## 🏗 Architecture

### Core Systems
```
GameContext (Central State)
├── Game Loop (requestAnimationFrame)
├── Resource Management (Beats, BPS, Hardware)
├── Pattern Generation (Strudel Code)
└── Achievement System

StrudelEngine Hook
├── Audio Context Management
├── Pattern Evaluation
└── Visualization Integration

Component Tree
├── App (Layout)
├── Clicker (Manual Beats)
├── StrudelOutput (Audio Controls + Visualization)
├── ModuleShop (Code Purchases)
├── HardwareShop (Capacity Upgrades)
├── PatternBuilder (Educational Preview)
└── Achievements/News (Progress Tracking)
```

### Key Design Patterns
- **Context + Hook Pattern**: Centralized state with specialized hooks
- **Immutable Updates**: React setState patterns for predictable updates
- **Type Safety**: Comprehensive TypeScript interfaces
- **Test-Driven**: Playwright tests validate all user interactions

## 🎵 Strudel Integration Details

### Code Generation
The game generates authentic Strudel patterns based on owned modules:
```javascript
// Basic start
s("bd")

// With multiple modules
s("bd hh sd hh")

// With effects unlocked
s("bd hh sd hh").lpf(800).room(0.3)

// Advanced patterns
s("<bd [hh hh]> sd hh").stack(note("c3 e3 g3").s("sawtooth"))
```

### Visual Feedback
- **Mini-notation highlighting**: Active pattern segments highlighted
- **Punchcard view**: Time-based pattern visualization
- **Piano roll**: Note-based pattern display
- **Debug mode**: Real-time pattern inspection

## 🌳 AST Pattern System

AlgoRave IDLE features a sophisticated **Abstract Syntax Tree (AST)** system for representing and manipulating musical patterns. This enables interactive pattern editing where users can click on pattern elements to transform them.

### Core AST Architecture

#### Node Types
```typescript
type ASTNodeType = 
  | 'sound'           // Basic sound: sound("bd")
  | 'sequence'        // Sequential patterns: "bd sd hh"
  | 'stack'           // Parallel patterns: ["bd", "sd"]
  | 'repeat'          // Repetition: "bd*4"
  | 'subdivision'     // Time subdivision: "bd*[2 3 2]"
  | 'rest'            // Silence: ~
  | 'euclidean'       // Euclidean rhythm: "bd(3,8)"
  | 'polyrhythm'      // Polyrhythmic: "bd(3,8,2)"
  | 'effect'          // Effect chain: .gain(0.5)
  | 'variable'        // Variable reference: $kick
  | 'pattern';        // Root pattern container
```

#### Interactive Pattern Building
```typescript
// Create basic patterns
const kick = patternBuilder.sound('bd');
const hat = patternBuilder.sound('hh');
const pattern = patternBuilder.sequence(kick, hat);

// Transform patterns through mutations
const mutations = [
  { type: 'add_repeat', targetId: kick.id, value: 4 },
  { type: 'euclideanify', targetId: hat.id, value: { pulses: 3, steps: 8 } },
  { type: 'add_effect', targetId: pattern.id, value: { type: 'lpf', value: 800 } }
];
```

### Interactive Features

#### Click-to-Edit Interface
- **Visual Pattern Rendering**: Each AST node renders as a clickable UI element
- **Context-Aware Mutations**: Right-click suggests relevant transformations
- **Real-Time Preview**: Changes immediately generate new Strudel code
- **Undo/Redo Support**: Full pattern history for experimentation

#### Smart Mutation System
The AST system provides intelligent suggestions based on context:

```typescript
// For a basic sound node "bd"
const suggestedMutations = [
  'Replace with related sample (sd, hh, cp)',
  'Add repetition (*2, *4, *8)',
  'Create euclidean rhythm (3,8), (5,8)',
  'Add effect (.lpf, .gain, .delay)',
  'Subdivide into sequence',
  'Add rest for spacing'
];
```

#### Pattern Complexity Metrics
```typescript
interface PatternMetrics {
  nodeCount: number;              // Total AST nodes
  depth: number;                  // Maximum nesting level
  rhythmicComplexity: number;     // Euclidean patterns, subdivisions
  harmonicComplexity: number;     // Melodic elements, effects
  interactiveElements: number;    // Clickable/editable components
}
```

### Sample Categorization

#### Comprehensive Sample Library
The AST system includes a curated categorization of 1000+ samples from Dirt-Samples:

```typescript
const SAMPLE_CATEGORIES = [
  { name: 'Bass Drums', samples: ['bd', 'bassdm', 'clubkick', 'hardkick'], mutationWeight: 10 },
  { name: 'Snares & Claps', samples: ['sd', 'cp', 'hand', 'rim'], mutationWeight: 9 },
  { name: 'Hi-hats', samples: ['hh', 'hc', 'ho', 'oh'], mutationWeight: 8 },
  // ... 17 total categories
];
```

#### Intelligent Sample Suggestions
- **Category-Based**: Suggest samples from the same musical category
- **Weighted Random**: Popular samples suggested more frequently  
- **Context Aware**: Drum samples for rhythm, melodic for harmony
- **Usage Tracking**: Learn user preferences over time

### Usage Analytics

#### Sample Usage Tracking
```typescript
interface SampleUsageStats {
  [sampleName: string]: {
    timesUsed: number;            // Usage counter
    totalPlayTimeSeconds: number; // Duration metrics
    lastUsed: number;             // Timestamp for relevance
  };
}
```

#### Achievement Integration
- **Rhythm Rookie**: Use a sample 10 times
- **Beat Veteran**: Use a sample 100 times  
- **Sample Master**: Use a sample 1000 times
- **Groove Legend**: Use a sample 10,000 times
- **Pattern Architect**: Unlock interactive editing
- **Sample Explorer**: Use 20 different samples

### Technical Implementation

#### AST to Strudel Code Generation
```typescript
function generateStrudelCode(node: ASTNode, context: CodeGenerationContext): string {
  switch (node.type) {
    case 'sound':
      return `sound("${node.sample}")`;
    case 'sequence':
      return `"${node.children.map(generateStrudelCode).join(' ')}"`;
    case 'euclidean':
      return `${generateStrudelCode(node.children[0])}(${node.pulses},${node.steps})`;
    case 'effect':
      return `${generateStrudelCode(node.children[0])}.${node.effectType}(${node.effectValue})`;
    // ... handle all node types
  }
}
```

#### Performance Optimization
- **Immutable Updates**: All AST mutations create new trees
- **Node Reuse**: Unchanged subtrees are preserved
- **Lazy Evaluation**: Code generation only when needed
- **Memoization**: Cache expensive operations

### Educational Progression

#### Gradual Complexity Introduction
1. **Basic Sounds** → `sound("bd")` nodes
2. **Sequences** → Sequential container nodes  
3. **Effects** → Effect chain nodes
4. **Rhythms** → Euclidean and subdivision nodes
5. **Advanced** → Polyrhythms, variables, stacks

#### Learning Through Interaction
- **Visual Understanding**: See pattern structure clearly
- **Experimental Safety**: Easy undo encourages exploration
- **Progressive Unlocks**: New node types unlock with advancement
- **Contextual Help**: Tooltips explain musical concepts

### Future Enhancements

#### Planned AST Features
- **Pattern Templates**: Pre-built complex patterns to modify
- **Collaborative Editing**: Real-time multi-user pattern building
- **Pattern Evolution**: AI-suggested mutations for creativity
- **Export/Import**: Share patterns as JSON between users
- **Version History**: Timeline of pattern evolution
- **Performance Mode**: Optimize AST for live performance

The AST system transforms StrudelIdle from a simple idle game into a powerful, educational pattern editor that makes live coding accessible and engaging for all skill levels.

## 🧪 Testing Strategy

### End-to-End Coverage
- **Audio Functionality**: Strudel initialization, start/stop, pattern updates
- **Game Progression**: Module purchases, hardware upgrades, achievements
- **UI Interactions**: All buttons, forms, and display updates
- **Pattern Generation**: Correct Strudel syntax at all complexity levels

### Test Categories
- `audio-functionality.spec.ts` - Core audio system
- `game-features.spec.ts` - Idle game mechanics
- `strudel-progression.spec.ts` - Educational progression
- `dual-audio-system.spec.ts` - Pattern visualization
- `strudel-improvements.spec.ts` - New features validation

## 🎨 Design System

### Color Palette
- Dark theme optimized for long coding sessions
- Strudel-inspired accent colors
- High contrast for accessibility
- Consistent semantic color usage

### Component Library
- Reusable UI components with Tailwind CSS
- Responsive design for all screen sizes
- Keyboard accessibility
- Screen reader friendly

## 🔮 Future Roadmap

### Phase 2: Advanced Features
- **Chord Progressions**: Jazz harmony system
- **MIDI Integration**: Connect hardware controllers
- **Pattern Sharing**: Export/import user patterns
- **Collaboration**: Multi-player sessions

### Phase 3: Production
- **Performance**: Optimize for mobile devices
- **Analytics**: Track learning progression
- **Content**: More module types and progressions
- **Accessibility**: Full WCAG compliance

## 🤝 Contributing

We welcome contributions!

## 📄 License

This project is licensed under the GPL v3 License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Strudel.cc Team**: For creating an amazing live coding environment
- **TidalCycles Community**: For pioneering algorithmic music patterns
- **Idle Game Community**: For inspiring engaging progression mechanics
- **React Community**: For excellent tools and documentation

---

Built with ❤️ for the live coding and idle gaming communities.
