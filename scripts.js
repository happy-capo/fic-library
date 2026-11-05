'use strict';

const site = window.SITE || {};
const fics = (window.FICS || []).slice();

// ---------------------------------------------------------------------
// helper methods
// ---------------------------------------------------------------------

// quick selector (i ain't typing all that)
const $ = (selector) => document.querySelector(selector);

// status indicators
const STATUS = {
  wip:      { label: 'In Progress' },
  complete: { label: 'Complete' },
  hiatus:   { label: 'On Hiatus' }
};

// clean up text so it doesn't break the html if I get silly with the blurbs
function strip(s) {
    if (s == null) return "";
    return s.replace(/<\/?[^>]+(>|$)/g, "");
}

// clean up special regex characters in case we get funky with the search bar
function stripRegEx(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------
// site rendering methods
// ---------------------------------------------------------------------

function renderSiteHeader() {
    document.title = site.title || 'My Fic Library';
    $('#title').textContent = site.title || 'My Fic Library';
    $('#tagline').textContent = site.tagline || '';
    $('#tagline').hidden = !site.tagline;
    $('#links').innerHTML = (site.links || [])
        .map((link) => `<a href="${strip(link.url)}" target="_blank" rel="noopener">${strip(link.label)}</a>`)
        .join('');
    $('#metadata').innerHTML = `<span>${fics.length} fics and counting!</span>`;
    $('#notice-title').textContent = site.noticeTitle || '';
    $('#notice-text').textContent = site.noticeText || '';
    $('#notice').hidden = !site.noticeTitle;
    $('#search').placeholder = site.searchPlaceholder || '';
}

// ---------------------------------------------------------------------
// search-related methods
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    function filterFics() {
        let completedOnly = $('#checkbox').checked;
        let searchString = $('#search').value;
        let escapedSearchString = stripRegEx(searchString);
        let regex = new RegExp(escapedSearchString, 'i');

        // nothing searched, only filter by completion status
        if (!searchString)
            return completedOnly ? fics.filter(fic => fic.status == 'complete') : fics;

        // otherwise include the search filtering
        return fics.filter(fic => {
            if (completedOnly && fic.status !== 'complete') return;
            let ficSoup = [fic.title, fic.series, fandomName(fic.fandom), fandomCode(fic.fandom)]
                .concat(fic.ships || [], fic.tags || [], fic.characters || [])
                .join(' ')
                .toLowerCase();

            return regex.test(ficSoup);
        });
    }

    $('#search').addEventListener('input', function(event) {
        const filteredFics = filterFics();
        visible = filteredFics;
        renderList();
    });

    $('#checkbox').addEventListener('change', function(event) {
        const filteredFics = filterFics();
        visible = filteredFics;
        renderList();
    });
});

// ---------------------------------------------------------------------
// fic card rendering methods
// ---------------------------------------------------------------------

function titleHTML(fic) {
    return fic.url
        ? `<a href="${strip(fic.url)}" target="_blank" rel="noopener">${strip(fic.title)}</a>`
        : strip(fic.title);
}

function seriesHTML(fic) {
    if (!fic.series) return '';
    return `<p class="series">Part ${fic.part} of ${strip(fic.series)}</p>`;
}

function shipsHTML(fic) {
    const ships = fic.ships ? fic.ships.map(strip).join(' | ') : "Genfic!";
    return ships ? `<p class="ships">${ships}</p>` : '';
}

function charactersHTML(fic) {
    const label = fic.ships ? "Additional Characters: " : "Characters: "
    const characters = (fic.characters || []).map(strip).join(' | ');
    return characters ? `<p class="characters">${label}${characters}</p>` : '';
}

function tagsHTML(fic) {
    const items = (fic.tags || []).map((tag) => `<li>${strip(tag)}</li>`).join('');
    return items ? `<ul class="tags">${items}</ul>` : '';
}

function detailHTML(fic) {
    const status = STATUS[fic.status];
    return `
        <div class="detail"><dt>Length</dt><dd>${fic.length}</dd></div>
        ${fic.chapters ? `<div class="detail"><dt>Chapters</dt><dd>${strip(fic.chapters)}</dd></div>` : ''}
        <div class="detail"><dt>Status</dt><dd>${status.label}</dd></div>
        <div class="detail"><dt>Rating</dt><dd>${fic.rating}</dd></div>`;
}

function rowHTML(fic) {
    return `
        <div class="fic" id="fic-${fic.id}" style="--f:${fandomColor(fic.fandom)}">
            <div class="code" title="${strip(fandomName(fic.fandom))}">${strip(fandomCode(fic.fandom))}</div>
            <div class="content">
                <h2>${titleHTML(fic)}</h2>
                ${seriesHTML(fic)}
                ${shipsHTML(fic)}
                ${charactersHTML(fic)}
                ${fic.blurb ? `<p class="blurb">${fic.blurb}</p>` : ''}
                ${tagsHTML(fic)}
            </div>
            <dl class="details">
                ${detailHTML(fic)}
            </dl>
        </div>`;
}

// ---------------------------------------------------------------------
// fandom code rendering
// ---------------------------------------------------------------------

const fandomKeys = Object.keys(site.fandoms || {});
fics.forEach((fic) => {
    if (!fandomKeys.includes(fic.fandom))
        fandomKeys.push(fic.fandom);
});

const fandomName = (key) => site.fandoms[key].name;
const fandomCode = (key) => site.fandoms[key].code;
const fandomColor = (key) => 'var(--f' + ((fandomKeys.indexOf(key) % 6) + 1) + ')';

// ---------------------------------------------------------------------
// fic collection rendering methods
// ---------------------------------------------------------------------

let visible = fics.slice(); // the fics currently rendered

function renderList() {
    $('#fics').innerHTML = visible.map(rowHTML).join('');
    $('#count').textContent = `${visible.length} of ${fics.length} fics`;
}

function render() {
    renderList();
}

// let's go!
renderSiteHeader();
render();