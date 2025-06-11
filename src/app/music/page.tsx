import Image from "next/image";

export default function Music() {
  const releases = [
    {
      id: 1,
      title: "Release 1",
      genre: "rock",
      image: "https://picsum.photos/200",
    },
    {
      id: 2,
      title: "Release 2",
      genre: "pop",
      image: "https://picsum.photos/201",
    },
    {
      id: 3,
      title: "Release 3",
      genre: "rock",
      image: "https://picsum.photos/202",
    },
    {
      id: 4,
      title: "Release 4",
      genre: "jazz",
      image: "https://picsum.photos/203",
    },
    {
      id: 5,
      title: "Release 5",
      genre: "pop",
      image: "https://picsum.photos/204",
    },
    {
      id: 6,
      title: "Release 6",
      genre: "rock",
      image: "https://picsum.photos/205",
    },
    {
      id: 7,
      title: "Release 7",
      genre: "jazz",
      image: "https://picsum.photos/206",
    },
    {
      id: 8,
      title: "Release 8",
      genre: "pop",
      image: "https://picsum.photos/207",
    },
    {
      id: 9,
      title: "Release 9",
      genre: "rock",
      image: "https://picsum.photos/208",
    },
    {
      id: 10,
      title: "Release 10",
      genre: "jazz",
      image: "https://picsum.photos/209",
    },
  ];

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Music</h1>
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2">
          Filtra per genere:
        </label>
        <select id="filter" className="border p-2 rounded">
          <option value="all">Tutti</option>
          <option value="rock">Rock</option>
          <option value="pop">Pop</option>
          <option value="jazz">Jazz</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {releases.map((release) => (
          <div
            key={release.id}
            className="border p-4 rounded shadow aspect-square flex flex-col items-center"
          >
            <Image
              src={release.image}
              alt={release.title}
              width={150}
              height={150}
              className="rounded-full object-cover mb-2"
            />
            <h2 className="font-bold">{release.title}</h2>
            <p>Genere: {release.genre}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
