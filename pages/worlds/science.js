import WorldPage from '../../components/world/WorldPage'
import scienceData from '../../data/curriculum/science-ocean.json'

export default function ScienceOcean() {
  return <WorldPage worldId="science" curriculumData={scienceData} />
}
