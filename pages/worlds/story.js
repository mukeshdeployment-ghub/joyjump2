import WorldPage from '../../components/world/WorldPage'
import storyData from '../../data/curriculum/story-forest.json'

export default function StoryForest() {
  return <WorldPage worldId="story" curriculumData={storyData} />
}
