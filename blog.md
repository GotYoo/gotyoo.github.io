---
layout: interface
page_key: blog
title: 文章与思考 · Blog
description: GotYoo 的公开文章、技术笔记与阶段性思考。
permalink: /blog/
---
<section class="air-sub-hero">
  <div class="air-sub-hero__inner">
    <div class="air-badge">02 / PUBLIC WRITING &amp; NOTES</div>
    <h1 class="air-sub-title">Writing &amp; <em>Notes</em></h1>
    <p class="air-sub-desc">沉淀完整思考：技术实践复盘、Agent 架构设计，以及可以公开分享的阶段性手记。</p>
  </div>
</section>

<section class="air-sub-section">
  <div class="air-shell">
    <div class="air-two-col">
      <aside class="air-aside-card">
        <div class="air-aside-sticky">
          <span class="air-aside-label">WRITING MANIFESTO</span>
          <h2 class="air-aside-heading">先写清楚，<br>再写得更多。</h2>
          <p class="air-aside-desc">文章不追求高频堆砌，而追求每一次记录都有明确的问题、推演与工程经验。</p>
          <div class="air-aside-stats">
            <div><b>{{ site.posts.size }}</b><span>篇公开手记</span></div>
            <div><b>Active</b><span>持续更新中</span></div>
          </div>
        </div>
      </aside>

      <div class="air-main-col">
        <div class="air-card-list">
          {% if site.posts.size > 0 %}
            {% for post in site.posts %}
            <a class="air-post-card" href="{{ post.url | relative_url }}">
              <div class="air-post-card__head">
                <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y.%m.%d" }}</time>
                <span class="air-post-card__tag">深度手记</span>
              </div>
              <h2 class="air-post-card__title">{{ post.title }}</h2>
              <p class="air-post-card__excerpt">{{ post.excerpt | strip_html | truncate: 120 | default: "点击阅读全文，查看完整架构思考与工程实践。" }}</p>
              <div class="air-post-card__footer">
                <span class="air-read-more">阅读正文</span>
                <span class="air-arrow">↗</span>
              </div>
            </a>
            {% endfor %}
          {% else %}
            <div class="air-empty-card">
              <h2>第一篇文章，应该值得被写下。</h2>
              <p>目前还没有正式公开文章。发布内容后将自动汇入此列表。</p>
            </div>
          {% endif %}
        </div>
      </div>
    </div>
  </div>
</section>
