<?php

/*
 * Combo widget for Yii2
 *
 * @link      https://github.com/hiqdev/yii2-combo
 * @package   yii2-combo
 * @license   BSD-3-Clause
 * @copyright Copyright (c) 2015-2016, HiQDev (http://hiqdev.com/)
 */

namespace hiqdev\combo;

use yii\helpers\Html;

/**
 * Class can be used for Combo instances, based on static data that should be submitted as array.
 * This implementation of [[Combo]] renders [[Html::activeDropDownList()]] instead of hidden input
 * and allows browser to submit input as array.
 *
 * Usage example:
 *
 * ```php
 *  echo $form->field($model, 'login_in')->widget(MultipleStaticCombo::class, [
 *      'hasId' => true,
 *      'data' => [
 *          'persons' => ['silverfire' => 'Dmitry Naumenko', 'sol' => 'Andrii Vasyliev'],
 *          'bots' => ['r2d2' => 'Artoo-Detoo']
 *      ],
 *      'inputOptions' => [
 *          'groups' => ['persons' => 'Humans', 'bots' => 'Robots'],
 *          'multiple' => true
 *      ]
 *  ])
 * ```
 *
 * @property mixed data
 */
class MultipleStaticCombo extends Combo
{
    public $name = 'default';

    public $type = 'default';

    /**
     * @var array Data to be
     */
    public $data;

    public function getPluginOptions($options = [])
    {
        $options = parent::getPluginOptions();
        unset($options['select2Options']['ajax']);

        return $options;
    }

    /**
     * @inheritdoc
     */
    protected function renderInput()
    {
        return Html::activeDropDownList($this->model, $this->attribute, $this->data, $this->inputOptions);
    }
}
