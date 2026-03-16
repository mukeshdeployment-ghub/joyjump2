import WorldPage from '../../components/world/WorldPage'
import hindiData from '../../data/curriculum/hindi-world.json'

export default function HindiWorld() {
  return <WorldPage worldId="hindi" curriculumData={hindiData} />
}
