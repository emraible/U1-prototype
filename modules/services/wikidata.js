import { json as d3_json } from 'd3-request';

import { utilQsString } from '../util';
import { currentLocale } from '../util/locale';

var endpoint = 'https://www.wikidata.org/w/api.php?';
var _wikidataCache = {};

export default {

    init: function() {},

    reset: function() {
        _wikidataCache = {};
    },


    // Given a Wikipedia language and article title, return an array of
    // corresponding Wikidata entities.
    itemsByTitle: function(lang, title, callback) {
        if (!title) {
            callback('', {});
            return;
        }

        lang = lang || 'en';
        d3_json(endpoint + utilQsString({
            action: 'wbgetentities',
            format: 'json',
            sites: lang.replace(/-/g, '_') + 'wiki',
            titles: title,
            languages: 'en', // shrink response by filtering to one language
            origin: '*'
        }), function(err, data) {
            if (err || !data || data.error) {
                callback('', {});
            } else {
                callback(title, data.entities || {});
            }
        });
    },

    entityByQID: function(qid, callback) {
        if (!qid) {
            callback('', {});
            return;
        }
        if (_wikidataCache[qid]) {
            callback('', _wikidataCache[qid]);
            return;
        }

        var lang = currentLocale.replace(/-/g, '_');

        d3_json(endpoint + utilQsString({
            action: 'wbgetentities',
            format: 'json',
            ids: qid,
            props: /*sitelinks|*/'labels|descriptions',
            //sitefilter: lang + 'wiki',
            languages: lang,
            languagefallback: 1,
            origin: '*'
        }), function(err, data) {
            if (err || !data || data.error) {
                callback('', {});
            } else {
                _wikidataCache[qid] = data.entities[qid];
                callback(qid, data.entities[qid] || {});
            }
        });
    }

};
