/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function () {
    'use strict';

    var formType = $('#question-form-datas-block').data('form-type');
    var surveyId = $('#question-form-datas-block').data('survey-id');
    
    if (formType === 'edit') {
        var questionId = $('#question-form-datas-block').data('question-id');
    }
    var choiceId;

    function enableTypedQuestionConfiguration()
    {
        var questionType = $('#question_form_type').val();
        
        if (questionType === 'multiple_choice_single' ||
            questionType === 'multiple_choice_multiple') {
        
            var route = (formType === 'create') ?
                Routing.generate(
                    'claro_survey_typed_question_create_form',
                    {
                        'survey': surveyId,
                        'questionType': questionType
                    }
                ) :
                Routing.generate(
                    'claro_survey_typed_question_edit_form',
                    {
                        'survey': surveyId,
                        'question': questionId,
                        'questionType': questionType
                    }
                );
            
            $.ajax({
                url: route,
                type: 'GET',
                success: function (datas) {
                    $('#typed-question-form-block').html('<hr>' + datas);
                    choiceId = parseInt($('#choice-index-block').data('current-choice-index'));
                }
            });
            $('#typed-question-form-block').show('slow', function () {
                $(this).removeClass('hidden');
                enableChoiceOtherLabel();
            });
        } else {
            $('#typed-question-form-block').hide('slow');
        }
    }
    
    function enableCommentLabel()
    {
        var commentChk = $('#question_form_commentAllowed').is(':checked');
        var commentLabelElement = $('#question_form_commentLabel').parents('.form-group');
        
        if (commentChk) {
            commentLabelElement.show('slow');
        } else {
            commentLabelElement.hide('slow');
        }
    }
    
    function enableChoiceOtherLabel()
    {
        var choiceOtherChk = $('#choice-other-chk').is(':checked');
        var choiceOtherElement = $('#choice-other-label-element');
        
        if (choiceOtherChk) {
            choiceOtherElement.show('slow');
        } else {
            choiceOtherElement.hide('slow');
        }
    }

    $('#question_form_commentAllowed').on('change', function () {
        enableCommentLabel();
    });
    
    $('#typed-question-form-block').on('change', '#choice-other-chk', function () {
        enableChoiceOtherLabel();
    });

    $('#question_form_type').on('change', function () {
        enableTypedQuestionConfiguration();
    });
    
    $('#typed-question-form-block').on('click', '#add-choice-btn', function () {
        choiceId++;
        var newTr = '<tr id="choice-row-' +
            choiceId +
            '"><td><textarea class="claroline-tiny-mce" name="choice[' +
            choiceId +
            ']"></textarea></td><td style="vertical-align: middle"><span class="btn btn-danger delete-choice-btn" data-choice-id="' +
            choiceId +
            '">' +
            Translator.get('platform' + ':' + 'delete') +
            '</span></td></tr>';
                             
        $('#choices-table').append(newTr);
    });

    $('#typed-question-form-block').on('click', '.delete-choice-btn', function () {
        var dataChoiceId = $(this).data('choice-id');
        $('#choice-row-' + dataChoiceId).remove();
    });
    
    $(document).ready(function () {
        enableCommentLabel();
        enableTypedQuestionConfiguration();
        enableChoiceOtherLabel();
    });
})();