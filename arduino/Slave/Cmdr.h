#ifndef CMDR_H
#define CMDR_H

#define MAX_MSG_SIZE    60
#include <stdint.h>
#include <Stream.h>

// command line structure
typedef struct _cmd_t
{
    char *cmd;
    void (*func)(int argc, char **argv);
    struct _cmd_t *next;
} cmd_t;

void cmdInit(Stream *);
void cmdPoll();
void cmdAdd(char *name, void (*func)(int argc, char **argv));
void cmdParse(char *cmd);
uint32_t cmdStr2Num(char *str, uint8_t base);

#endif //CMDR_H
