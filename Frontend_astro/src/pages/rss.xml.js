import rss from '@astrojs/rss';
import { getContent } from '../lib/strapi';
export function GET(context){return rss({title:'Aksara — Wawasan',description:'Catatan Astro, Strapi, dan konten bilingual.',site:context.site,items:getContent('id').articles.map(x=>({title:x.title,description:x.summary||x.seo.metaDescription,pubDate:new Date(x.publishedAt),link:`/wawasan/${x.slug}/`}))})}
