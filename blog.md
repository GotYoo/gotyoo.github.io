---
layout: interface
page_key: blog
title: Blog
description: GotYoo 的公开文章、技术笔记与阶段性思考。
permalink: /blog/
---
<section class="inner-hero"><div class="inner-hero__content"><p class="inner-hero__eyebrow reveal" data-reveal>02 / PUBLIC WRITING & NOTES</p><h1 data-title><span>Bl<em>og</em></span></h1><p class="inner-hero__desc reveal" data-reveal>文章负责记录完整的思考过程：技术实践、项目复盘，以及一些可以公开分享的阶段性笔记。</p><div class="inner-hero__count"><span>LONG-FORM THINKING</span><br><span>PUBLIC ARCHIVE</span></div></div></section>
<section class="page-section"><div class="section-shell"><div class="article-shell"><aside class="article-aside reveal" data-reveal><p>WRITING INDEX</p><h2>先写清楚，<br>再写得更多。</h2><p>公开文章会自动汇入右侧列表。</p></aside><div class="article-list">
{% if site.posts.size > 0 %}{% for post in site.posts %}<a class="article-row reveal" data-reveal href="{{ post.url | relative_url }}"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y.%m.%d" }}</time><h2>{{ post.title }}</h2><i>↗</i></a>{% endfor %}{% else %}<div class="empty-note reveal" data-reveal><h2>第一篇文章，<br>应该值得被写下。</h2><p>目前还没有正式公开文章。这里先保留干净的文章入口，后续发布内容后会自动生成列表。</p></div>{% endif %}
</div></div></div></section>
