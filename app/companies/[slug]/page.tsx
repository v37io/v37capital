import { Mdx } from "@/app/components/mdx";
import { Redis } from "@upstash/redis";
import { allCompanies } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";

export const revalidate = 60;

type Props = {
  params: {
    slug: string;
  };
};

const redis = Redis.fromEnv();

export async function generateStaticParams(): Promise<Props["params"][]> {
  return allCompanies
    .filter((c) => c.published)
    .map((c) => ({
      slug: c.slug,
    }));
}

export default async function PostPage({ params }: Props) {
  const slug = params?.slug;
  const company = allCompanies.find((company) => company.slug === slug);

  if (!company) {
    notFound();
  }

  const views =
    (await redis.get<number>(["pageviews", "companies", slug].join(":"))) ?? 0;

  return (
    <div className="bg-zinc-50 min-h-screen">
      <Header project={company} views={views} />
      <ReportView slug={company.slug} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <Mdx code={company.body.code} />
      </article>
    </div>
  );
}
