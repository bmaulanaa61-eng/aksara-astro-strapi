import rss from '@astrojs/rss';
import { getContent } from '../../lib/strapi';
export function GET(context){return rss({title:'Aksara — Insights',description:'Notes on Astro, Strapi, and bilingual content.',site:context.site,items:getContent('en').articles.map(x=>({title:x.title,description:x.summary||x.seo.metaDescription,pubDate:new Date(x.publishedAt),link:`/en/insights/${x.slug}/`}))})}
