/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function() {
    /* Get Tracker */
    if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
        this.custTracker = rma.customize.custTracker;
    } else if (typeof custTracker != 'undefined') {
        this.custTracker = custTracker;
    } else {
        this.custTracker = [];
    }

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }

    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined' ? rma.customize.src : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

    return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

    var tagsStr = '';

    for (var obj in tags) {
        if (tags.hasOwnProperty(obj)) {
            tagsStr += '&' + obj + '=' + tags[obj];
        }
    }

    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

    if (typeof url != "undefined" && url != "") {

        if (typeof mraid !== 'undefined') {
            mraid.open(url);
        } else {
            window.open(url);
        }
    }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

    /*
     * name is used to make sure that particular tracker is tracked for only once
     * there might have the same type in different location, so it will need the name to differentiate them
     */
    name = name || type;

    if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
        for (var i = 0; i < this.custTracker.length; i++) {

            if (name === 'participate' && i !== 2) continue;

            if (name !== 'participate' && i === 2) continue;

            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            // if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
            //     src = src.replace('tt={{rmatt}}', '');
            // } else {
            src = src.replace('{{rmatt}}', tt);
            this.trackedEngagementType.push(tt);
            // }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

var renderAd = function() {
    var sent = false;
    var app = new mads();

    var score = 0;

    var qa = [{
        'Q': 'This Amendment protects our right to keep and bear arms?',
        'A': ['27th Amendment', '2nd Amendment', '5th Amendment', '1st Amendment'],
        'T': 'amendment_q2',
        'C': '2nd Amendment'
    }, {
        'Q': 'This Supreme Court case struck down Chicago\'s handgun ban',
        'A': ['District of Columbia v. Heller', 'McDonald v. Chicago', 'Wisconsin v. Illinois', 'Terminiello v. Chicago'],
        'T': 'supremecourt_q2',
        'C': 'District of Columbia v. Heller'
    }, {
        'Q': 'This president tried to pass an unconstitutional ban on so-called "assault weapons"',
        'A': ['Bill Clinton', 'George W. Bush', 'Jimmy Carter', 'Ronald Reagan'],
        'T': 'unconstitutionalban_q2',
        'C': 'Bill Clinton'
    }, {
        'Q': 'This protection of freedom passed MOST RECENTLY in Texas',
        'A': ['Concealed Carry', 'Castle Doctrine', 'Open Carry & Campus Carry', 'Interstate Reciprocity'],
        'T': 'protectionoffreedom_q2',
        'C': 'Open Carry & Campus Carry'
    }, {
        'Q': 'This Founding Father is most credited for writing the 2nd Amendment',
        'A': ['George Washington', 'Thomas Jefferson', 'Alexander Hamilton', 'James Madison'],
        'T': 'foundingfather_q2',
        'C': 'James Madison',
        'End': true
    }]

    var current = 0,
        pageq = [],
        results = [],
        content = '<img src="' + app.path + 'img/first.gif">';

    app.contentTag.innerHTML = '<div id="main" class="abs"><div id="ad-content" class="abs"><div id="front" class="abs" style="top:-120px;">' + content + '</div></div><div id="disclaimer" class="abs">Pol. ad. Texans for Greg Abbott</div></div>';

    var main = document.getElementById('main'),
        content = document.getElementById('ad-content'),
        front = document.getElementById('front'),
        disclaimer = document.getElementById('disclaimer');

    var end = document.createElement('div');
    end.className = 'thankyou hide abs';
    end.innerText = 'THANK YOU';

    var signed = document.createElement('div');
    signed.className = 'signed hide abs';
    signed.innerHTML = '<strong style="font-size:26px;">Signed book contest</strong></br><br/>Enter to win a signed copy of<br/>Gov. Greg Abbots\'s<br/><i style="font-size:26px;">Broken But Unbowed,</i><br/>and join the fight to restore<br/>our Constitution!<br/><br/><br/><form id="mail-submit"><input type="email" id="email" name="email" placeholder="Enter email address here:" required /><br/><button style="cursor:pointer;" type="submit">Submit</button></form>'

    var vote = document.createElement('div');
    vote.className = 'vote hide abs';
    vote.innerHTML = '<strong style="font-size:26px;">Register to vote</strong><br/><br/>Hillary Clinton has vowed to be<br/>EVEN WORSE THAN OBAMA<br/>on gun rights.<br/><br/><br/>Register to vote to<br/>KEEP TEXAS RED!<br/><br/><br/><a style="cursor:pointer;" id="vote_finish" href="https://webservices.sos.state.tx.us/vrrequest/index.asp" target="_blank">CLICK HERE</a>';

    var pager = document.createElement('div');
    pager.className = 'pager abs';
    pager.innerText = '1/' + qa.length;
    content.appendChild(pager);

    var arrows = document.createElement('div');
    arrows.className = 'arrows hide abs';
    arrows.innerHTML = '<img class="left" src="' + app.path + 'img/larrow.png"><img class="right" src="' + app.path + 'img/rarrow.png">'
    content.appendChild(arrows);

    var left = document.querySelector('.left');
    var right = document.querySelector('.right');
    left.addEventListener('click', function(e) {

        if (this.style.opacity < 1) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        pageq[current].className = 'questionaire hide' + (qa[current].Long ? ' long' : '') + (qa[current].End ? ' end' : '');
        current -= 1;
        pageq[current].className = 'questionaire' + (qa[current].Long ? ' long' : '') + (qa[current].End ? ' end' : '');
        setTimeout(function() {
            pageq[current].style.opacity = 1;
        }, 1)

        if (typeof results[current - 1] !== 'undefined') {
            arrows.childNodes[0].style.opacity = 1;
        } else {
            arrows.childNodes[0].style.opacity = 0;
        }

        if (typeof results[current] !== 'undefined') {
            arrows.childNodes[1].style.opacity = 1;
        } else {
            arrows.childNodes[1].style.opacity = 0;
        }

        for (var c in pageq[current].childNodes) {
            var s = pageq[current].childNodes[c]
            if (typeof s.className !== 'undefined') {
                s.className = s.className.replace('selected', '');
            }
        }

        if (typeof results[current] !== 'undefined') {
            var s = pageq[current].childNodes[qa[current].A.indexOf(results[current].A) + 1];
            s.className = s.className + ' selected';
        }

        pager.innerText = (current + 1) + '/' + qa.length;
    }, false);

    right.addEventListener('click', function(e) {

        if (this.style.opacity < 1) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        pageq[current].className = 'questionaire hide' + (qa[current].Long ? ' long' : '') + (qa[current].End ? ' end' : '');
        current += 1;
        pageq[current].className = 'questionaire' + (qa[current].Long ? ' long' : '') + (qa[current].End ? ' end' : '');
        setTimeout(function() {
            pageq[current].style.opacity = 1;
        }, 1)

        if (typeof results[current - 1] !== 'undefined') {
            arrows.childNodes[0].style.opacity = 1;
        } else {
            arrows.childNodes[0].style.opacity = 0;
        }

        if (typeof results[current] !== 'undefined') {
            arrows.childNodes[1].style.opacity = 1;
        } else {
            arrows.childNodes[1].style.opacity = 0;
        }

        for (var c in pageq[current].childNodes) {
            var s = pageq[current].childNodes[c]
            if (typeof s.className !== 'undefined') {
                s.className = s.className.replace('selected', '');
            }
        }

        if (typeof results[current] !== 'undefined') {
            var s = pageq[current].childNodes[qa[current].A.indexOf(results[current].A) + 1];
            s.className = s.className + ' selected';
        }


        pager.innerText = (current + 1) + '/' + qa.length;
    }, false);

    var getURLParameter = function(name, custom) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec((typeof custom !== 'undefined' ? custom : location.search)) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }

    var sendResult = function(r) {
        var req = new XMLHttpRequest();
        var url = '//www.cdn.serving1.net/poll';
        var q = '';

        if (r.length !== qa.length) {
            for (var i = r.length; i < qa.length; i++) {
                r.push({
                    'Q': qa[i].Q,
                    'A': 'skipped',
                    'T': qa[i].T
                })
            }
        }

        for (var i in r) {
            //'q' + (parseInt(i) + 1) + '='
            q += r[i].T + '=' + r[i].A + '&';
        }
        q = q.slice(0, -1).replace(/\?/g, '');

        if (typeof app.custTracker[0] !== 'undefined') {
            var campaignId = getURLParameter('campaignId', app.custTracker[0]);
            var rmaId = getURLParameter('rmaId', app.custTracker[0]);
            var userId = getURLParameter('userId', app.custTracker[0]);
            var cb = getURLParameter('id', app.custTracker[1]);
            var q = 'campaignId=' + campaignId + '&rmaId=' + rmaId + '&userId=' + userId + '&cb=' + cb + '&' + q;
        }

        if (!sent) {
            req.open("POST", url + '?' + q, true);

            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            req.onreadystatechange = function() {
                if (req.readyState == 4 && req.status == 200) {
                    //console.log(req.responseText);
                }
            }
            req.send(q);
            sent = true;
        }
    }

    for (var i in qa) {
        var q = document.createElement('div');
        q.className = 'questionaire hide' + (qa[i].Long ? ' long' : '') + (qa[i].End ? ' end' : '');
        q.id = 'question_' + i;
        q.setAttribute('data-index', i);
        q.setAttribute('data-tracker_type', qa[i].T);
        q.setAttribute('data-answer', qa[i].C);
        q.setAttribute('data-correct', false);
        q.innerHTML = '<div class="question q' + i + '">' + qa[i].Q + '</div>';

        for (var a in qa[i].A) {
            var answer = document.createElement('div');
            answer.className = 'answer q' + i + ' a' + a
            answer.innerText = qa[i].A[a]
            q.appendChild(answer);

            answer.onclick = function(e) {
                if (e.target.className.indexOf('selected') > -1) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                if (this.parentElement.getAttribute('data-answer') === this.innerText) {
                    this.parentElement.setAttribute('data-correct', true);
                } else {
                    this.parentElement.setAttribute('data-correct', false);
                }

                if (results.map(function(e) {
                        return e.Q
                    }).indexOf(this.parentElement.childNodes[0].innerText) === -1) {
                    results.push({
                        'Q': this.parentElement.childNodes[0].innerText,
                        'A': e.target.innerText,
                        'T': this.parentElement.getAttribute('data-tracker_type'),
                        'C': this.parentElement.getAttribute('data-correct')
                    })
                } else {
                    results[this.parentElement.getAttribute('data-index')] = {
                        'Q': this.parentElement.childNodes[0].innerText,
                        'A': e.target.innerText,
                        'T': this.parentElement.getAttribute('data-tracker_type'),
                        'C': this.parentElement.getAttribute('data-correct')
                    }
                }

                if (typeof results[current] !== 'undefined') {
                    arrows.childNodes[0].style.opacity = 1;
                } else {
                    arrows.childNodes[0].style.opacity = 0;
                }

                if (typeof results[current + 1] !== 'undefined') {
                    arrows.childNodes[1].style.opacity = 1;
                } else {
                    arrows.childNodes[1].style.opacity = 0;
                }

                this.parentElement.className = 'questionaire hide' + (qa[current].Long ? ' long' : '') + (qa[current].End ? ' end' : '');
                current = (current != pageq.length - 1) ? current + 1 : 'end';

                if (current !== 'end') {
                    pageq[current].className = 'questionaire' + (qa[current].Long ? ' long' : '') + (qa[current].End ? ' end' : '');
                    setTimeout(function() {
                        pageq[current].style.opacity = 1;
                    }, 1)
                    pager.innerText = (current + 1) + '/' + qa.length;
                    app.tracker('E', this.parentElement.getAttribute('data-tracker_type'));
                } else {

                    score = results.filter(function(e) {
                        return e.C === 'true';
                    }).length;

                    pager.innerText = ''
                    arrows.childNodes[1].style.opacity = 0;
                    arrows.childNodes[0].style.opacity = 0;
                    end.className = 'thankyou abs';

                    var dsc = ['2nd Amendment Rifleman', '2nd Amendment Marksman', '2nd Amendment Sharpshooter', '2nd Amendment Expert'];
                    var rank = 'Novice';


                    if (score === 0 || score === 1) {
                        end.innerHTML = 'You answered<br/><strong>' + score + ' Question</strong> Correctly.<br/>You are <strong>Novice</strong><br/><br/>Sorry, you didn\'t get enough<br/>correct answers to qualify the<br/>ranking. That is ok. Retake it to<br/>see if you can do better next time.';

                    } else {
                        end.innerHTML = '<strong style="font-size:26px;">Congratulations</strong><br/><br/>You answered<br/><strong>' + score + ' Questions</strong> Correctly.<br/><br/>You are a<br/><strong>' + dsc[score - 2] + '</strong>';
                        rank = dsc[score - 2];
                    }

                    switch (score) {
                        case 0:
                        case 1:
                            app.tracker('E', 'novice_1qncorrect_q2');
                            break;
                        case 2:
                            app.tracker('E', 'rifleman_2qncorrect_q2');
                            break;
                        case 3:
                            app.tracker('E', 'marksman_3qncorrect_q2');
                            break;
                        case 4:
                            app.tracker('E', 'sharpshooter_4qncorrect_q2');
                            break;
                        case 5:
                            app.tracker('E', 'expert_5qncorrect_q2');
                            break;
                    }

                    end.innerHTML += '<br/><br/><div class="end_actions" id="again">Take the quiz again</div><div class="end_actions" id="signed">Signed Book Contest</div><div class="end_actions" id="vote">Register to Vote</div><br/>';

                    var twit = encodeURIComponent('I got "' + rank + '" on "Gun Rights" — Join the Fight to Restore our Constitution! What about you? http://bit.ly/1IKvM70')
                    var linkedin = encodeURIComponent('http://bit.ly/28PjTFR') + '&title=' + encodeURIComponent('Gun Rights — Join the Fight to Restore our Constitution!') + '&summary=' + encodeURIComponent('http://bit.ly/28PjTFR I got "' + rank + '" on "Gun Rights" — Join the Fight to Restore our Constitution! What about you? Thank you know a lot about Gun Rights. Test your knowledge on Guns and Gun Rights. Register to Vote.') + '&source=' + encodeURIComponent('http://bit.ly/28PjTFR');
                    var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('http://bit.ly/28PjTFR') + '&qoute=' + encodeURIComponent('I got "' + rank + '" on "Gun Rights" — Join the Fight to Restore our Constitution! What about you? http://bit.ly/1IKvM70');
                    //http://bit.ly/1IKvM70
                    fb = 'https://www.facebook.com/dialog/share?app_id=608702982590706&display=popup&href=' + encodeURIComponent('http://bit.ly/28PjTFR') + '&redirect_uri=' + encodeURIComponent('http://bit.ly/1IKvM70') + '&quote=' + encodeURIComponent('I got "' + rank + '" on "Gun Rights" — Join the Fight to Restore our Constitution! What about you? http://bit.ly/28PjTFR');

                    // if (end.innerHTML.indexOf('social') === -1) {
                    //     end.innerHTML += [
                    //         '<div class="social">',
                    //         '<a href="' + fb + '" target="_blank"><img src="' + app.path + 'img/f.png' + '" /></a>',
                    //         '<a href="https://twitter.com/home?status=' + twit + '" target="_blank"><img src="' + app.path + 'img/t.png" title="Tweet"/></a>',
                    //         '<a href="https://www.linkedin.com/shareArticle?mini=true&url=' + linkedin + '" target="_blank"><img src="' + app.path + 'img/in.png' + '" /></a></div>',
                    //     ].join('');
                    // }

                    end.querySelector('#again').addEventListener('click', function() {
                        pageq[0].className = 'questionaire';
                        arrows.className = 'arrows abs';
                        arrows.childNodes[0].style.opacity = 0;
                        arrows.childNodes[1].style.opacity = 0;
                        setTimeout(function() {
                            pageq[0].style.opacity = 1;
                            arrows.style.opacity = 1;
                        }, 1)
                        end.className += ' hide';
                        current = 0;
                        var selects = document.querySelectorAll('.selected');
                        Array.prototype.forEach.call(selects, function(el, i) {
                            el.className = el.className.replace('selected', '');
                        });
                        results = [];
                        app.tracker('E', 'retakequiz_q2');
                    }, false);

                    end.querySelector('#signed').addEventListener('click', function() {
                        end.className += ' hide';
                        signed.className = signed.className.replace('hide', '');
                    }, false);

                    end.querySelector('#vote').addEventListener('click', function() {
                        end.className += ' hide';
                        vote.className = vote.className.replace('hide', '');
                    });

                    app.tracker('E', this.parentElement.getAttribute('data-tracker_type'));

                    setTimeout(function() {
                        //sendResult(results);
                    }, 100)
                }


            };
        }

        pageq.push(q);
        content.appendChild(q);

        if (qa[i].End) {
            var last = document.createElement('div');
            last.className = 'answer last';
            last.innerText = 'Last Question'
            q.appendChild(last);
            content.appendChild(end);
            content.appendChild(signed);
            content.appendChild(vote);
        }
    }

    signed.addEventListener('click', function(e) {
        this.querySelector('#mail-submit button').click();
    }, false);

    signed.querySelector('#mail-submit').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        signed.style.top = '0';
        signed.style.fontSize = '25px';
        signed.innerHTML = 'Thank you for submitting<br/>your email.';
        app.tracker('E', 'signedbkcontest_emailsubmit_q2', 'signedbkcontest_emailsubmit_q2', this.elements['email'].value);
        app.tracker('E', 'thankyou_q2');    
    }, false);

    // vote.querySelector('#vote_finish').addEventListener('click', function () {
    //     app.tracker('E', 'registertovote_clickhere_q2');
    // })

    vote.addEventListener('click', function () {
        app.tracker('E', 'registertovote_clickhere_q2');
        this.querySelector('a').click();
    })



    main.style.background = 'url(' + app.path + 'img/bg.jpg' + ')';
    front.style.zIndex = 99;

    var onceMain = true;


    main.addEventListener('click', function() { // For Main Click
        if (onceMain) {
            front.style.display = 'none';
            disclaimer.style.opacity = '1';
            pageq[0].className = 'questionaire';
            arrows.className = 'arrows abs';
            arrows.childNodes[0].style.opacity = 0;
            arrows.childNodes[1].style.opacity = 0;
            setTimeout(function() {
                pageq[0].style.opacity = 1;
                arrows.style.opacity = 1;
            }, 1)
            onceMain = false;
            app.tracker('E', 'participate');
        }
    }, false); // For Main Click

    var receiveMessage = function(e) {
        if (typeof e.data.auth !== 'undefined' && e.data.auth.type === 'closeExpandable') {
            //sendResult(results);
        }
    }
    window.addEventListener("message", receiveMessage, false);

    app.loadCss(app.path + 'css/style.css');
};

var ad = renderAd();
