import "server-only"

interface Resource {
  title: string;
  url: string;
}

async function getDescription(videoId: string): Promise<{ descriptionParagraph: string; resources: Resource[] }> {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${"AIzaSyAp0q6VB2OSUqneDWz9If5YYvcGuU8q7ds"}`);
  const description = await response.json() as {
    items: {
      snippet: {
        description: string
      }
    }[]
  }

  const lines = description.items[0].snippet.description.split('\n');
  const resources: Resource[] = [];
  let descriptionParagraph = '';
  let resourcesStart = false;

  for (const line of lines) {
    if (!descriptionParagraph && line.trim() !== '') {
      descriptionParagraph = line;
    }

    if (line.trim() === '==========Resources==========') {
      resourcesStart = true;
      continue;
    }

    if (resourcesStart && line.trim() !== '') {
      const resourceInfo = line.split(/:(.+)/);
      resources.push({
        title: resourceInfo[0].trim(),
        url: resourceInfo[1].trim(),
      });
    }

    if (resourcesStart && line.trim() === '') {
      break;
    }
  }

  return {
    descriptionParagraph,
    resources,
  };
}

async function getData() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=UCld68syR8Wi-GY_n4CaoJGA&maxResults=20&order=date&type=video&key=${"AIzaSyAp0q6VB2OSUqneDWz9If5YYvcGuU8q7ds"}`);

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json() as {
    items: {
      id: {
        videoId: string
      },
      snippet: {
        title: string,
        publishTime: string
      }
    }[]
  };

  const videoDetailsPromises = data.items.map((item) => getDescription(item.id.videoId));

  const videoDetails = await Promise.all(videoDetailsPromises);

  return data.items.map((item, index) => {
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      publishTime: item.snippet.publishTime,
      ...videoDetails[index]
    };
  });
}

export default async function Home() {
  const data = await getData()

  return (
    <main className="md:max-w-3xl mx-auto">
      <div className="grid gap-4 px-4 py-8">
        <h1 className="text-slate-50 font-extrabold text-xl pb-1">
          brodie robertson if he was good
        </h1>

        <p className="text-slate-300">this is a joke.</p>
        <p className="text-slate-300 line-through">but not really</p>

        {data.map(video =>
          <div key={video.id} className="rounded-md bg-slate-700 border-slate-700 border p-4">
            <p className="text-lg font-bold text-slate-300 pb-2">{video.title}</p>

            <p className="text-slate-400 pb-2">{video.descriptionParagraph}</p>

            <ul>
              {video.resources.map((resource, index) => <li key={index} className="before:content-['-'] before:absolute before:left-0 before:text-slate-500 relative pl-[1.2em]"><a href={resource.url} className="text-blue-400">{resource.title}</a></li>)}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
