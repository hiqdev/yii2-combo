<?php
/**
 * Combo widget for Yii2
 *
 * @link      https://github.com/hiqdev/yii2-combo
 * @package   yii2-combo
 * @license   BSD-3-Clause
 * @copyright Copyright (c) 2015-2017, HiQDev (http://hiqdev.com/)
 */

namespace hiqdev\combo;

/**
 * Class for Static combo.
 *
 * @property mixed data
 */
class StaticCombo extends Combo
{
    public $name = 'default';

    public $type = 'default';

    public $data = [];

    /**
     * @var bool whether to add an empty option for the select. Works only when [[multiple]] is set to `false`.
     *
     * Info: The `select` HTML element selects the first option in the list,
     * if there is no other option marked as `selected`. This property prevents
     * this behaviour by adding option with empty value.
     */
    public $prependEmptyOption = true;

    public function getPluginOptions($options = [])
    {
        $options = parent::getPluginOptions();
        unset($options['select2Options']['ajax']);

        return $options;
    }

    protected function getCurrentOptions()
    {
        $option = [];

        if (!$this->multiple && $this->prependEmptyOption === true) {
            $option = ['' => ''];
        }

        return $option + (array) $this->data;
    }
}
