idf_component_register(SRCS "app_main.c"
                    INCLUDE_DIRS "."
                    REQUIRES mqtt json bmp280 i2cdev nvs_flash esp_wifi esp_netif esp_event protocol_examples_common)
