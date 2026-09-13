---
layout: interface
page_key: blog
title: 深度公开手记与思考 · Blog
description: Kairo 的公开文章、系统架构设计笔记与阶段性工程思考。
permalink: /blog/
---
<section class="subpage-hero">
  <span class="subpage-badge">02 // PUBLIC WRITING &amp; NOTES</span>
  <h1 class="subpage-title">Writing &amp; Notes</h1>
  <p class="subpage-desc">
    沉淀完整思考：技术实践复盘、Agent 架构设计，以及可以公开分享的阶段性手记。
  </p>
</section>

<div class="writing-grid" style="margin-bottom: 60px;">
  <!-- Manifesto Card -->
  <aside class="writing-manifesto-card">
    <div>
      <span class="meta-chip">WRITING MANIFESTO</span>
      <h2 class="manifesto-quote" style="margin-top: 16px;">先写清楚，<br>再写得更多。</h2>
      <p class="manifesto-desc" style="margin-top: 14px;">
        文章不追求高频堆砌，而追求每一次记录都有明确的问题边界、系统推演与可验证的工程结论。
      </p>
    </div>

    <div class="writing-stats">
      <div class="stat-item">
        <b>{{ site.posts.size | default: "01" }}</b>
        <span>篇公开手记</span>
      </div>
      <div class="stat-item">
        <b>ACTIVE</b>
        <span>持续更新中</span>
      </div>
    </div>
  </aside>

  <!-- Essays List -->
  <div class="essay-list">
    {% if site.posts.size > 0 %}
      {% for post in site.posts %}
      <article class="essay-card">
        <div class="essay-meta">
          <span class="essay-tag">{{ post.category | default: "SYSTEM NOTE" }}</span>
          <span>•</span>
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y.%m.%d" }}</time>
          <span>•</span>
          <span>深度手记</span>
        </div>
        <h2 class="essay-title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        <p class="essay-excerpt">
          {{ post.excerpt | strip_html | truncate: 140 | default: "点击阅读全文，查看完整架构思考与工程实践。" }}
        </p>
        <div class="essay-footer">
          <a href="{{ post.url | relative_url }}" class="read-link">
            <span>阅读正文</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
          </a>
        </div>
      </article>
      {% endfor %}
    {% else %}
      <div class="about-bio-card" style="text-align: center; padding: 60px 20px;">
        <h3>第一篇文章，应该值得被写下。</h3>
        <p style="color: var(--text-muted); margin-top: 8px;">目前文章正汇入中，敬请期待。</p>
      </div>
    {% endif %}
  </div>
</div>
