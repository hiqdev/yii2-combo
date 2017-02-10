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

    public function getPluginOptions($options = [])
    {
        $options = parent::getPluginOptions();
        unset($options['select2Options']['ajax']);

        return $options;
    }

    protected function getCurrentOptions()
    {
        return $this->data;
    }
}
