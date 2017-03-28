/*
  This is a basic skeleton JavaScript update processor.

  In order for this to be executed, it must be properly wired into solrconfig.xml; by default it is commented out in
  the example solrconfig.xml and must be uncommented to be enabled.

  See http://wiki.apache.org/solr/ScriptUpdateProcessor for more details.
*/
// Collection database enry : display value map
var collection_sorted_dictionary = {
    "ICA":"001::International Clarinet Association (ICA) Score Collection",
    "NACWPI":"002::National Association of College Wind and Percussion Instructors (NACWPI) Score Collection",
    "Stevens":"003::Milton Stevens Collection",
    "ABA":"004::American Bandmasters Association (ABA) Score Collection",
    "ABA - Banda Mexicana":"005::ABA - J.E. Roach Banda Mexicana Music Collection",
    "ABA - William Hill":"006::ABA - William Hill Collection",
    "ABA - King":"007::ABA - Karl King Scores",
    "ABA - Mayhew Lake":"008::ABA - Mayhew Lake \"Symphony in Gold\" Collection",
    "ABA - Reed":"009::ABA - Alfred Reed Collection",
    "ABA - Star Music Co":"010::ABA - Star Music Company Collection",
    "20th/21st Century Consort":"011::20th/21st Century Consort Collection",
    "Stephen Albert":"012::Stephen Albert Collection",
    "Harold Brown":"013::Harold Brown Collection",
    "CMP":"014::Contemporary Music Project (NAfME/MENC) Scores",
    "Lynn Steele":"015::Lynn Steele Collection",
    "George Tremblay":"016::George Tremblay Collection",
    "Philip Gordon":"017::Philip Gordon Papers",
    "VdGSA":"018::Viola da Gamba Society of America Archives"
};

// Instrument code - label map
var instrument_dictionary = {
    "any":"any instrument",
    "any-bb":"any b-flat instrument",
    "any-bc":"any bass clef instrument",
    "any-eb":"any e-flat instrument",
    "any-melody":"any melody instrument",
    "any-tc":"any treble clef instrument",
    "basso-continuo":"basso continuo",
    "ondes-martenot":"ondes martenot",
    "org":"organ",
    "pno":"piano",
    "pno-prep":"prepared piano",
    "pno-toy":"toy piano",
    "synth":"synthesizer",
    "cymbal-finger":"finger cymbal",
    "drum-bass":"bass drum",
    "drum-hand":"hand drum",
    "drum-snr":"snare drum",
    "drum-st":"drum set",
    "glock":"glockenspiel",
    "mrmba":"marimba",
    "perc":"percussion",
    "rhythm":"rhythm section",
    "tamb":"tambourine",
    "timp":"timpani",
    "xylo":"xylophone",
    "bsn":"bassoon",
    "cl":"clarinet",
    "cl-a":"a clarinet",
    "cl-alt":"alto clarinet",
    "cl-alt-f":"f alto clarinet",
    "cl-bb":"b-flat clarinet",
    "cl-bs":"bass clarinet",
    "cl-c":"c clarinet",
    "cl-choir":"clarinet choir",
    "cl-ctralt":"contralto clarinet",
    "cl-ctralt-bb":"b-flat contralto clarinet",
    "cl-ctralt-eb":"e-flat contralto clarinet",
    "cl-ctrbs":"contrabass clarinet",
    "cl-ctrbs-bb":"b-flat contrabass clarinet",
    "cl-ctrbs-eb":"e-flat contrabass clarinet",
    "cl-eb":"e-flat clarinet",
    "cl-eb-alt":"alto e-flat clarinet",
    "cl-sop":"soprano clarinet",
    "cl-sop-ab":"a-flat soprano clarinet",
    "cl-sop-bb":"b-flat soprano clarinet",
    "cl-sop-eb":"e-flat soprano clarinet",
    "ctrbs":"contrabassoon",
    "ctrbs-bb":"e-flat contrabassoon",
    "ctrbs-eb":"b-flat contrabassoon",
    "fl":"flute",
    "fl-a":"alto flute",
    "fl-bs":"bass flute",
    "hrn-eng":"english horn",
    "ob":"oboe",
    "picc":"piccolo",
    "rec":"recorder",
    "rec-alt":"alto recorder",
    "rec-bs":"bass recorder",
    "rec-sop":"soprano recorder",
    "rec-ten":"tenor recorder",
    "sax":"saxophone",
    "sax-alt":"alto saxophone",
    "sax-alt-eb":"alto e-flat saxophone",
    "sax-b":"bass saxophone",
    "sax-bar-eb":"baritone e-flat saxophone",
    "sax-bari":"baritone saxophone",
    "sax-bb":"b-flat saxophone",
    "sax-bb-sop":"b-flat soprano saxophone",
    "sax-bs":"bass saxophone",
    "sax-c":"c saxophone",
    "sax-eb":"e-flat saxophone",
    "sax-eb-alt":"e-flat alto saxophone",
    "sax-f-mezsop":"f mezzo-soprano saxophone",
    "sax-sop":"soprano saxophone",
    "sax-ten":"tenor saxophone",
    "woodwinds":"woodwind instruments",
    "woodwinds-choir":"woodwind choir",
    "woodwinds-orch":"wind orchestra",
    "bari":"baritone",
    "bari-bc":"bass clef baritone",
    "bari-tc":"treble clef baritone",
    "brass":"brass instruments",
    "cor":"cornet",
    "euph":"euphonium",
    "hrn":"horn",
    "hrn-a":"a horn",
    "hrn-basst":"basset horn",
    "hrn-bb":"b-flat horn",
    "hrn-c":"c horn",
    "hrn-d":"d horn",
    "hrn-e":"e horn",
    "hrn-eb":"e-flat horn",
    "tba-bb":"b-flat tuba",
    "tba-bs":"bass tuba",
    "tba-c":"c tuba",
    "tba-eb":"e-flat tuba",
    "tba-f":"f tuba",
    "tba-tc":"treble clef tuba",
    "tbn":"trombone",
    "tbn-alt":"alto trombone",
    "tbn-bs":"bass trombone",
    "tbn-f":"trombone with f attachment",
    "tbn-ten":"tenor trombone",
    "tpt":"trumpet",
    "tpt-a":"a trumpet",
    "tpt-bb":"b-flat trumpet",
    "tpt-c":"c trumpet",
    "tpt-d":"d trumpet",
    "tpt-eb":"e-flat trumpet",
    "tpt-f":"f trumpet",
    "tpt-picc":"piccolo trumpet",
    "gtr":"guitar",
    "strings":"string instruments",
    "strings-quar":"string quartet",
    "vcl":"cello (violincello)",
    "vla":"viola",
    "vla-dg":"viola da gamba",
    "vln":"violin",
    "narr":"narrator",
    "satb":"choir",
    "voice-alt":"alto voice",
    "voice-bar":"baritone voice",
    "voice-bass":"bass voice",
    "voice-mez-sop":"mezzo soprano voice",
    "voice-sop":"soprano voice",
    "voice-ten":"tenor voice",
    "band-brass":"brass band",
    "band-concert":"concert band",
    "band-marching":"marching band",
    "band-symph":"symphonic band",
    "jazz":"jazz ensemble",
    "orch":"orchestra",
    "orch-chamber":"chamber orchestra",
    "orch-polka":"polka orchestra",
    "orch-string":"string orchestra",
    "accord":"accordion",
    "conch":"conch shell",
    "gtr-bs":"bass guitar",
    "penny-whistle":"penny whistle",
    "opt":"optional",
    "ens":"ensemble"
  
};

// This function will be called for every record during index.
function processAdd(cmd) {
    doc = cmd.solrDoc;  // org.apache.solr.common.SolrInputDocument
    id = doc.getFieldValue("id");
    logger.info("update-script#processAdd: id=" + id);

    var instrument_field_name = "instrumentation";
    var collection_field_name = "collection";

    collection_value = doc.getFieldValue(collection_field_name);
    if(collection_value != null) {
        // Add sorted collection dictionay field
        var field_name = "collection_dictionary";
        var sorted_field_name = "collection_sorted_dictionary";
        if(collection_value in collection_sorted_dictionary) {
            doc.addField(field_name, collection_sorted_dictionary[collection_value].substr(5));
            logger.debug("update-script#Added: " + field_name + "=" + collection_sorted_dictionary[collection_value]);
            doc.addField(sorted_field_name, collection_sorted_dictionary[collection_value]);
            logger.debug("update-script#Added: " + sorted_field_name + "=" + collection_sorted_dictionary[collection_value]);
        } else {
            doc.addField(field_name, collection_value);
            logger.debug("update-script#Added: " + field_name + "=" + collection_value + "(WARN: NOT IN DICTIONARY)");
            doc.addField(sorted_field_name, collection_value + "::" + collection_value);
            logger.debug("update-script#Added: " + sorted_field_name + "=" + collection_value + "(WARN: NOT IN DICTIONARY)");
        }
    }

    instrumentation_value = doc.getFieldValues(instrument_field_name);
    if(instrumentation_value != null) {
        var instruments_map = {};
        var is_instrument_required = {};
        var instruments_with_alternatives = [];
        var instrument;
        instrumentation_values = instrumentation_value.toArray();

        // Move instrumentation without alternatives to front
        instrumentation_values = moveNonAlternativesToFront(instrumentation_values);

        // Clear current value of the instrumentation field
        doc.removeField(instrument_field_name);
        for(i=0; i < instrumentation_values.length; i++) {
            var value = instrumentation_values[i];

            var info_count_array, info_count_length;
            var info_count_length_map = {};

            if(value.indexOf("|") != -1) {  // e.g. cl|sax e.g. cl(2)|sax

                var expanded_combined = "";
                var alternatives = {};

                // Splitting on "|" and adding each of them as separate value.
                // Also, concatenate the expanded version and add it as another field
                while(value.indexOf("|") != -1) {
                    curr = value.substring(0, value.indexOf("|"));
                    value = value.substring(value.indexOf("|")+1);

                    // Add label value of the current instrument to the dictionary fields
                    instrument = getInstrumentDictionaryValue(curr);

                    alternatives[instrument.name] = true;

                    // Add last value of the instrumentation field
                    doc.addField(instrument_field_name, curr);
                    logger.debug("update-script#Added: " + instrument_field_name + "=" + curr);

                    // Add to map
                    if(!(instrument.name in info_count_length_map)) {
                        info_count_length_map[instrument.name] = getCurrentInfoCountLength(instrument.name, instruments_map)
                    }
                    info_count_length = info_count_length_map[instrument.name];
                    is_required = (instrument.name in is_instrument_required)? true : false;
                    addInstrumentToMap(instrument, instruments_map, is_required, info_count_length);

                    // Append to combined alternatives
                    expanded_combined += joinedNameInfoCount(instrument) + " OR ";
                }
                // Add label value of the last instrument to the dictionary fields
                instrument = getInstrumentDictionaryValue(value);

                alternatives[instrument.name] = true;

                // Set is_instrument_required true, only if all alternatives are count variants
                // of same instrument E.g: cl(2)|cl(3)
                if (Object.keys(alternatives).length == 1) {
                    is_instrument_required[instrument.name] = true;
                }

                // Add to map
                if(!(instrument.name in info_count_length_map)) {
                    info_count_length_map[instrument.name] = getCurrentInfoCountLength(instrument.name, instruments_map)
                }
                info_count_length = info_count_length_map[instrument.name];
                is_required = (instrument.name in is_instrument_required)? true : false;
                addInstrumentToMap(instrument, instruments_map, is_required, info_count_length);

                // Append to combined alternatives
                expanded_combined += joinedNameInfoCount(instrument);

                // Add to combined field to instruments_with_alternatives
                instruments_with_alternatives.push(expanded_combined);

                // Add last value of the instrumentation field
                doc.addField(instrument_field_name, value);
                logger.debug("update-script#Added: " + instrument_field_name + "=" + value);

            } else { // e.g.1 sax e.g.2 cl(2)
                //addDynamicInstrumentationField(value, doc);
                // Add label value of the instrument to the dictionary fields
                instrument = getInstrumentDictionaryValue(value);

                // Set is_instrument_required true
                is_instrument_required[instrument.name] = true;

                // Add to map
                addInstrumentToMap(instrument, instruments_map, true);

                // Add to combined field to nstruments_with_alternatives
                instruments_with_alternatives.push(joinedNameInfoCount(instrument));

                // Add value to the instrumentation field
                doc.addField(instrument_field_name, value);
                logger.debug("update-script#Added: " + instrument_field_name + "=" + value);
            }
        }

        // Add values in map to doc
        for (var key in instruments_map) {
            // Add key to instrument_dictionary
            doc.addField("instrumentation_dictionary", key);
            logger.debug("update-script#Added: instrumentation_dictionary=" + key);

            var info_count_array = instruments_map[key];

            // Add joined key value to instrument_dictionary_full
            for (var i=0; i<info_count_array.length; i++) {
                var instrument = {"name": key, "info_count": info_count_array[i]};
                doc.addField("instrumentation_dictionary_full", joinedNameInfoCountWithSortPrefix(instrument));
                logger.debug("update-script#Added: instrumentation_dictionary_full=" + joinedNameInfoCountWithSortPrefix(instrument));
            }
        }

        // Add values in instruments_with_alternatives to doc
        for (var i=0; i<instruments_with_alternatives.length; i++) {
            doc.addField("instrumentation_dictionary_full_with_alt", instruments_with_alternatives[i]);
            logger.debug("update-script#Added: instrumentation_dictionary_full_with_alt=" + instruments_with_alternatives[i]);
        }
    }
}

/*
This is to help combination logic to work.

E.g.: cl|sax,cl,pno => cl,pno,cl|sax [Here cl and pno are required, while sax has alternative]
E.g.: pno,cl|vln,cl(2)|cl(3) => pno,cl(2)|cl(3),cl|vln [Here pno and cl are required, while vln has alternative]

*/
function moveNonAlternativesToFront(instrumentation_values) {
    var non_alternate_instr = [];
    var alternate_instr = [];
    var non_count_alts = [];
    var length;
    for(i=0; i < instrumentation_values.length; i++) {
        var value = instrumentation_values[i];
        if(value.indexOf("|") != -1) {
            alternate_instr.push(value);
        } else {
            non_alternate_instr.push(value);
        }
    }
    for(i=0; i < alternate_instr.length; i++) {
        var val = alternate_instr[i];
        var curr = "";
        var prev = "";
        var count_alts = true;
        while(val.indexOf("|") != -1) {
            prev = curr;
            curr = val.substring(0, val.indexOf("|"));
            val = val.substring(val.indexOf("|")+1);
            length = curr.indexOf('(');
            curr = curr.substring(0, (length != -1) ? length : curr.length());
            if(prev != "" && prev != curr) {
                count_alts = false;
            }
        }
        length = val.indexOf('(');
        val = val.substring(0, (length != -1) ? length : val.length());
        if(val != curr) {
            count_alts = false;
        }
        if(count_alts) {
            non_alternate_instr.push(alternate_instr[i]);
        } else {
            non_count_alts.push(alternate_instr[i])
        }
    }
    return non_alternate_instr.concat(non_count_alts);
}

/*
E.g.:
instrument_value=cl(2)
Return {name:clarinet, info_count:2}

E.g.:
instrument_value=vln(opt)
Return {name:violin, info_count:optional}

E.g.:
instrument_value=pno(ens)
Return {name:piano, info_count:ensemble}

*/
function getInstrumentDictionaryValue(instrument_value) {
	var field_name = "instrumentation_dictionary";
	var full_field_name = "instrumentation_dictionary_full";
	var field_value;
	var instrument_code;
	var instrument_info;
	
	var pattern = /^(.*?)\(([0-9]+|ens|opt)\)/; // e.g. cl(2), cl(opt), cl(ens)
	var result = pattern.exec(instrument_value);
	if(result != null) {
		instrument_code = result[1];
		instrument_info = result[2];
	} else {
		instrument_code = instrument_value;
	}
	field_value = instrument_code;
	if(instrument_code in instrument_dictionary) {
		field_value = instrument_dictionary[instrument_code];
	}
    var info_count;
	if(instrument_info == "opt" || instrument_info == "ens") {
		info_count = instrument_dictionary[instrument_info];
	} else if(typeof instrument_info != 'undefined') {
		info_count = parseInt(instrument_info);
	} else {
		info_count = 1;
	}
    return {"name": field_value, "info_count": info_count};
}

/*
E.g:
instrument_name = clarinet
instruments_map = {clarinet:[2,4,ensemble], saxophone:[2]}

Info count array of clarinet is [2,4,ensemble]
Return 3
*/
function getCurrentInfoCountLength(instrument_name, instruments_map) {
    if (instrument_name in instruments_map) {
        return instruments_map[instrument_name].length;
    } else {
        return 0;
    }
}

/*

Instrument Map stores the possible counts of a instrument.
Once the entire field is processed, each possible count will 
be added to the index.

E.g:
Instrumentation string: cl(2),cl|sax,pno(ens)

Instrumentation Map:

{
    "clarinet": {2, 3},
    "saxophone": {1},
    "piano": {optional}
}

Indexed values:
instrumentation: cl(2), cl, sax, pno(ens)
instrumentation_dictionary: clarinet, saxophone, piano
Instrumentation_dictionary_full: 2 clarinet, 3 clarinet, 1 saxophone, piano [ensemble]
Instrumentation_dictionary_full_with_alt: 2 clarinet, 1 clarinet OR 1 saxophone, piano [ensemble]

*/
function addInstrumentToMap(instrument, instruments_map, is_required, info_count_length) {
    if (instrument.name in instruments_map) {
        var info_count_array = instruments_map[instrument.name];
        if (typeof instrument.info_count == "number") {
            if(typeof info_count_length == "undefined") {
                info_count_length = info_count_array.length;
            }
            if (info_count_length == 0) {
                info_count_array.push(instrument.info_count);
            } else {
                if(!is_required && info_count_array.indexOf(instrument.info_count) == -1) {
                    info_count_array.push(instrument.info_count);
                }
                for (var i=0; i<info_count_length; i++) {
                    if(typeof info_count_array[i] == "number") {
                        var new_count = info_count_array[i] + instrument.info_count;
                        if(info_count_array.indexOf(new_count) == -1) {
                            info_count_array.push(new_count);
                        }
                    }
                }
            }
        } else {
            info_count_array.push(instrument.info_count);
        }
    } else {
        instruments_map[instrument.name] = [instrument.info_count];
    }
}

/*
E.g:
instrument = {name: clarinet, info_count: 2}

Return "2 clarinet"
*/
function joinedNameInfoCount(instrument) {
    var joined;
    if (typeof instrument.info_count == "number") {
        joined = instrument.info_count + " " + instrument.name;
    } else {
        joined = instrument.name + " [" + instrument.info_count + "]";
    }
    return joined;
}

/*
E.g:
instrument = {name: clarinet, info_count: 2}

Return "clarinet002::2 clarinet"

The "clarinet002::" sort prefix will be trimmed by hippo solr display module.
*/
function joinedNameInfoCountWithSortPrefix(instrument) {
    var joined = joinedNameInfoCount(instrument);
    if (typeof instrument.info_count == "number") {
        // Pad zeros to instrument count E.g. 8=>008 10=>010
        var zero_padded_count = ("00" + instrument.info_count).slice(-3);
        joined = instrument.name + zero_padded_count + "::" + joined;
    } else {
        joined = instrument.name + instrument.info_count +  "::" + joined;
    }
    return joined;
}

function processDelete(cmd) {
  // no-op
}

function processMergeIndexes(cmd) {
  // no-op
}

function processCommit(cmd) {
  // no-op
}

function processRollback(cmd) {
  // no-op
}

function finish() {
  // no-op
}
